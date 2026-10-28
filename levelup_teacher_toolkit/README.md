# LevelUp Teacher Toolkit — pastel classroom edition

Open **index.html** through VS Code Live Server. Keep this folder together. The alternative `levelup_teacher_toolkit.html` entry point is identical. No npm installation or build step is needed.

## This update

The interface now follows your supplied pastel classroom reference across teacher/student pages and classroom tools. See **UI_REDESIGN_NOTES.md** for the design files and verification. The owl, illustrated navigation, cream canvas, blue/mint sidebar, yellow active links, pastel counters and rounded panels are shared throughout. Both light and dark modes are supported.

Layout styles and English/Hindi fonts are bundled locally; there is no Tailwind CDN dependency.

## Preserved improvements

- Sidebar icons sit beside their labels in a consistent order, with Attendance's count on the right.
- Dark mode covers sidebar navigation, class selectors, disclosure panels, profiles, badges and form controls.
- Lumi's UI and assistant implementation are removed.
- Student names and **Open profile** buttons open the learner dialog. The profile includes reading/math progression, attendance, group reassignment, editable teacher notes, intervention history, assessment, detailed growth and worksheet actions.
- Profile dialogs support Escape, focus trapping, and focus return. The top avatar opens a teacher profile with settings/logout; students have a redesigned personal profile page.
- The welcome page offers teacher/student email/password sign-in and self-registration when configured. Sign-up asks for a full name, email, password and Teacher/Student role; no student invitation code is required. Without configuration, it offers clearly labeled local demos.
- Supabase authenticates accounts and provisions teacher/student profiles automatically at sign-up. Students can self-register; row-level security limits account reads to the signed-in user.
- Attendance no longer treats missing records as automatically present.

## Supabase

Follow **SETUP_SUPABASE.md**. Run **supabase_auth_setup.sql**, then fill **supabase-config.js** with the project URL and public publishable key. New users can sign up as Teacher or Student in the app without invitation codes. For demo use, turn off email confirmation in Supabase settings if you wish to avoid sending verification emails; see the security caveat in the setup guide.

The legacy `supabase_schema_migration.sql` is retained as a reference only; it is not required for this auth setup. Supabase login needs network access and a configured project. The browser SDK is pinned to 2.57.4.

## Persistence and limits

Classroom work, notes, assignments and submissions remain local to the browser. Real accounts have separate local storage namespaces. Student sign-in loads only that signed-in learner's profile. Cross-device classroom syncing and shared assignment delivery are not implemented in this package. The included sample teacher classes remain demonstration data. Logging out locks the UI; browser-local classroom data remains on the device.

The student Creative corner includes optional ElevenLabs speech-to-text and text-to-speech through `supabase/functions/elevenlabs/index.ts`. The browser only sends requests to this authenticated Supabase Edge Function; keep the ElevenLabs key in Supabase Function Secrets, never in browser JavaScript. First revoke any key shared in chat and create a replacement. In **Supabase Dashboard → Edge Functions → Secrets**, save the replacement as `ELEVENLABS_API_KEY`; set `voiceId` in `elevenlabs-widget.js` to a voice available in your ElevenLabs account. From the project folder, deploy with `supabase functions deploy elevenlabs --project-ref oinluloilstnvpppdxxa` (install the Supabase CLI and run `supabase login` first). Voice input requires an authenticated account, microphone permission, and a secure context (HTTPS or localhost).

Any ElevenLabs key shared in chat, committed to source, or previously entered into the browser should be revoked and replaced before adding the replacement as a Supabase Function Secret.

PDF export loads html2pdf from its existing CDN; configured sign-in loads the Supabase SDK. Layout CSS, fonts and illustrations are local. Use a trusted browser/device for school records. Ripplix inspiration remains CSS-based, with no Ripplix dependency.

## Verification

Run:

```bash
node tests/ux-pages.cjs
node tests/ux-flow.cjs
node tests/accounts-profiles.cjs
node tests/auth-form.cjs
```

These cover teacher/student page generation, assignment publication/submission/review persistence, clickable profile actions and note saves, missing attendance, denied unprovisioned accounts, learner isolation, the signup form payload, and role enforcement using mocked services. JavaScript syntax and ZIP integrity are checked separately.

Earlier UI development reported 84 Chromium page checks across desktop/phone and light/dark modes. The updated authentication flow passed automated Node mock tests; a new live Chromium end-to-end run was blocked in this environment. Dashboard, classroom tool, profile and mobile layouts were visually reviewed. Phone navigation, the assignment wizard, profile notes and dismissal were checked. Live Supabase login/RLS verification against your hosted project remains pending.
