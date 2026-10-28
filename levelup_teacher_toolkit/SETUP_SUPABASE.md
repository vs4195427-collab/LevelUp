# LevelUp — simple Supabase sign-up and login

**What you get:** one log-in / sign-up screen with **Email**, **Password** and a **Teacher / Student** role selector. Sign-up also asks for a full name. After authentication, Teachers enter the teacher dashboard and Students enter their personal learning portal. Logout and session restore are handled by Supabase.

## Quick setup (5 steps)

1. Open the **Supabase project used by this ZIP** in your Supabase dashboard. Its public URL and publishable key are already in `supabase-config.js`. Change those values **only if you want a different project**. The key must be an `sb_publishable_...` key — never a service-role/secret key.
2. Open **SQL Editor → New query**, paste the **entire `supabase_auth_setup.sql`** file, and press **Run**. It creates `public.levelup_accounts`, a locked-down own-account read policy and the automatic new-user provisioning trigger. You can rerun this file to update an earlier LevelUp setup.
3. In **Authentication → Sign In / Providers → Email**, make sure email/password sign-in is enabled and **Allow new users to sign up** is enabled. For a quick *hackathon/demo*, you can temporarily turn **Confirm Email OFF**, so students and teachers can sign up without waiting for confirmation emails. **Important:** disabling email confirmation means email ownership is not verified; for a public production website, enable it and configure custom SMTP. Do not switch off email/password authentication itself.
4. In **Authentication → URL Configuration**, set **Site URL** to your deployed website, or your VS Code Live Server URL during testing (often `http://127.0.0.1:5500`). Add both your local and deployed website origins/URLs under Redirect URLs as needed. Supabase's recommended redirect URL settings depend on where it is hosted.
5. Open **`index.html` using VS Code Live Server** (right-click the file → Open with Live Server). Select **Sign up**, fill your name, email, password and Teacher/Student role. On your next visit use **Log in**. Use the same role you registered with. Click **Log out** from the top bar/profile. A Student cannot select Teacher to enter the teacher dashboard.

**Do not open directly with `file://`.** The application needs an internet connection for Supabase, and the Supabase JavaScript SDK is loaded from a pinned CDN version. No Node.js/npm/build step is needed.

## If login does not work

- **"Could not load account profile" / "profile not found":** Run `supabase_auth_setup.sql` in the **same project** configured in `supabase-config.js`. For an account created before this setup, choose **"Already registered but cannot access your account?"** on the login form to finish creating its role profile (email/password still required).
- **"Email not confirmed":** Confirm the email address or temporarily turn **Confirm Email** off while running a closed demo. Changes to this setting do not necessarily retroactively confirm old accounts.
- **Email sending limit:** Hosted Supabase's default email provider is restricted. For public rollout use custom SMTP; for a demo you may turn off confirmation after understanding the security trade-off.
- **"Invalid login credentials":** Use the original password or sign up with a new email. Teacher and Student are distinct roles; select the role used during registration.
- **"Could not load sign-in" or a blank screen:** Make sure Live Server and internet are working, and the browser can reach jsDelivr and your Supabase project.
- **Error "Database error saving new user":** The old database trigger might still be installed. Run the updated `supabase_auth_setup.sql` (it replaces the earlier trigger function).
- **Config mismatch:** The project ref in the ZIP's `supabase-config.js` must match the project where you executed SQL.

## Scope and privacy

Supabase securely authenticates user accounts and exposes only the logged-in user's `levelup_accounts` record via Row Level Security. Students cannot promote themselves into Teachers by changing the role selector or client-side metadata. **This is a login-and-role-routing integration, not a full cloud classroom backend:** assessments, class rosters, submissions, attendance and most activity state still live in this browser's local storage, isolated by user on this device. A Teacher's locally created classroom assignments will not automatically appear in a Student's account or another device. Demo teacher data is sample data. Independent Student sign-up intentionally does **not** require any invitation code or guarantee a specific teacher/class link.

`supabase_schema_migration.sql` is a separate legacy reference for classroom tables. **Do not run it just to enable authentication.** It does not establish this role-based login flow.
