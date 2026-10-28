-- ============================================================================
-- LevelUp Teacher Toolkit — Non-Destructive Supabase / PostgreSQL Schema V2
-- Respects STUDENT_DATA_WRITES_ENABLED = false in client demo environments
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('reading', 'math')),
  competency_code TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  question_count INTEGER NOT NULL CHECK (question_count BETWEEN 1 AND 50),
  difficulty_mode TEXT NOT NULL DEFAULT 'Balanced Progression',
  release_policy TEXT NOT NULL DEFAULT 'After Submission',
  created_by TEXT,
  class_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  competency_code TEXT NOT NULL,
  canonical_signature TEXT NOT NULL,
  skill_subtag TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'stretch')),
  prompt_en TEXT NOT NULL,
  prompt_hi TEXT,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  hint TEXT,
  explanation TEXT,
  UNIQUE (assessment_id, canonical_signature)
);

CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  student_id BIGINT NOT NULL,
  class_id TEXT NOT NULL,
  competency_code TEXT NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  state TEXT NOT NULL CHECK (state IN ('not_started', 'preparing', 'in_progress', 'submitting', 'completed', 'results')),
  question_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  unanswered_count INTEGER NOT NULL DEFAULT 0,
  score_pct INTEGER NOT NULL CHECK (score_pct BETWEEN 0 AND 100),
  mastery_band TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  canonical_signature TEXT NOT NULL,
  selected_option TEXT,
  correct_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_index)
);

CREATE TABLE IF NOT EXISTS public.student_competency_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id BIGINT NOT NULL,
  class_id TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('reading', 'math')),
  competency_code TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  baseline_score_pct INTEGER NOT NULL DEFAULT 40,
  current_score_pct INTEGER NOT NULL DEFAULT 50,
  assessed BOOLEAN NOT NULL DEFAULT true,
  mastery_status TEXT NOT NULL,
  seen_question_signatures JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, competency_code)
);

CREATE TABLE IF NOT EXISTS public.wonderlab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id BIGINT NOT NULL,
  playground_id TEXT NOT NULL CHECK (playground_id IN ('counting', 'numberline', 'baseten', 'fractions', 'shapes', 'reading')),
  learning_mode TEXT NOT NULL CHECK (learning_mode IN ('Explore', 'Learn', 'Practice', 'Assess')),
  competency_code TEXT NOT NULL,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  stars_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.class_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('reading', 'math')),
  term_week TEXT NOT NULL,
  total_students INTEGER NOT NULL,
  assessed_count INTEGER NOT NULL,
  unassessed_count INTEGER NOT NULL,
  level_1_count INTEGER NOT NULL,
  level_2_count INTEGER NOT NULL,
  level_3_count INTEGER NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL,
  student_id BIGINT NOT NULL,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  reason TEXT,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance_records(class_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);
