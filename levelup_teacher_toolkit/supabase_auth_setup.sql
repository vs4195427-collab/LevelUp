-- Run once in Supabase SQL Editor. Re-running safely updates the sign-up setup.
begin;

create sequence if not exists public.levelup_student_id_seq
  as bigint start with 1;

create table if not exists public.levelup_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  display_name text not null check (length(display_name) between 1 and 120),
  student_data jsonb,
  created_at timestamptz not null default now(),
  check (role <> 'student' or (
    student_data is not null
    and jsonb_typeof(student_data) = 'object'
    and student_data ? 'id'
    and student_data ? 'name'
    and jsonb_typeof(student_data->'id') = 'number'
    and jsonb_typeof(student_data->'name') = 'string'
  ))
);

alter table public.levelup_accounts
  add column if not exists invite_code text,
  add column if not exists teacher_id uuid references auth.users(id) on delete set null;

update public.levelup_accounts
set invite_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
where role = 'teacher' and invite_code is null;

create unique index if not exists levelup_accounts_invite_code_key
  on public.levelup_accounts (invite_code)
  where invite_code is not null;

alter table public.levelup_accounts enable row level security;
revoke all on public.levelup_accounts from anon, authenticated;
grant select on public.levelup_accounts to authenticated;

drop policy if exists "Read own school account" on public.levelup_accounts;
create policy "Read own school account" on public.levelup_accounts
for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.provision_levelup_account(
  p_user_id uuid,
  p_role text,
  p_display_name text,
  p_invite_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_name text := nullif(pg_catalog.btrim(p_display_name), '');
  normalized_code text := pg_catalog.upper(pg_catalog.btrim(coalesce(p_invite_code, '')));
  linked_teacher uuid;
  learner_id bigint;
begin
  if p_role is null or p_role not in ('teacher', 'student') then
    raise exception using message = 'Choose teacher or student to create an account.';
  end if;

  if normalized_name is null or pg_catalog.length(normalized_name) > 120 then
    raise exception using message = 'Enter a name between 1 and 120 characters.';
  end if;

  if p_role = 'teacher' then
    insert into public.levelup_accounts (user_id, role, display_name, invite_code)
    values (
      p_user_id,
      'teacher',
      normalized_name,
      pg_catalog.upper(pg_catalog.substr(pg_catalog.replace(gen_random_uuid()::text, '-', ''), 1, 12))
    )
    on conflict (user_id) do nothing;
    return;
  end if;

  -- Students can create independent accounts with no invitation.
  -- An optional code, when supplied by a future flow, links to a teacher.
  if normalized_code <> '' then
    select user_id into linked_teacher
      from public.levelup_accounts
      where role = 'teacher' and invite_code = normalized_code;
    if linked_teacher is null then
      raise exception using message = 'That invitation code is not valid.';
    end if;
  end if;

  learner_id := nextval('public.levelup_student_id_seq'::regclass);
  insert into public.levelup_accounts (
    user_id, role, display_name, teacher_id, student_data
  )
  values (
    p_user_id,
    'student',
    normalized_name,
    linked_teacher,
    pg_catalog.jsonb_build_object(
      'id', learner_id,
      'name', normalized_name,
      'roll', learner_id,
      'grade', '',
      'gender', '',
      'rBase', 'R1',
      'rCurr', 'R1',
      'mBase', 'M1',
      'mCurr', 'M1',
      'rScore', 0,
      'mScore', 0,
      'notes', '',
      'interventions', pg_catalog.jsonb_build_array()
    )
  )
  on conflict (user_id) do nothing;
end
$$;

revoke all on function public.provision_levelup_account(uuid, text, text, text)
  from public, anon, authenticated;

create or replace function public.levelup_complete_signup(
  p_role text,
  p_display_name text,
  p_invite_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  signed_in_user uuid := auth.uid();
begin
  if signed_in_user is null then
    raise exception using message = 'Sign in before completing account setup.';
  end if;

  perform public.provision_levelup_account(
    signed_in_user,
    p_role,
    p_display_name,
    p_invite_code
  );
end
$$;

revoke all on function public.levelup_complete_signup(text, text, text)
  from public, anon;
grant execute on function public.levelup_complete_signup(text, text, text)
  to authenticated;

create or replace function public.handle_levelup_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.provision_levelup_account(
    new.id,
    new.raw_user_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'invite_code'
  );
  return new;
end
$$;

revoke all on function public.handle_levelup_auth_user_created()
  from public, anon, authenticated;

drop trigger if exists on_levelup_auth_user_created on auth.users;
create trigger on_levelup_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_levelup_auth_user_created();

commit;

-- Teacher/student sign-up only requires full name, email, password and role.
-- Teachers still receive an optional invitation code for future class linking;
-- it is NOT required to register as a student.
-- Existing Auth users created before this setup can complete setup after
-- signing in; their role is selected explicitly instead of inferred.
