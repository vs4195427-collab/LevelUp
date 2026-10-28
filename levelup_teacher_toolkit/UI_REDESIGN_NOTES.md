# LevelUp — pastel classroom redesign

This update follows the supplied visual reference: cream workspace, blue-to-mint sidebar, owl brand mark, outlined pastel illustrations, yellow active navigation, mint and coral actions, cyan/yellow/lavender counters, white rounded panels and peach follow-up cards.

The same theme covers the teacher dashboard, classes, assignments and wizard, review, insights and detailed tracking, resources, settings, attendance, assessments, skill groups, worksheets, WonderLab, learning pathways, class setup, student home/homework/learning/progress/creative/profile pages, profile dialogs and sign-in screen. Night mode uses coordinated muted colors. Navigation, account roles and classroom behaviors remain intact.

## Open the website

Extract the ZIP and open **index.html** using VS Code Live Server. No installation or build is required. Keep all files and the `assets` folder together. Both HTML entry points load the same files.

Layout CSS, Nunito, Hindi font support and the SVG illustrations are local. PDF export still uses the existing html2pdf CDN; configured Supabase sign-in needs internet. No remote database or auth configuration was changed.

## Edit the design

- `school-theme.css`: shared colors, typography, component styles, responsive layouts, dark mode and print styling.
- `design.js`: original SVG illustrations, icons and legacy-page decoration.
- `ux.js`: role pages, reference-style dashboard and local assignment interactions.
- `assets/layout.css`: precompiled Tailwind layout utilities. Source: `tailwind.input.css` and `tailwind.config.cjs`. If HTML utility classes change, rebuild from this folder with `npx --yes --package=tailwindcss@3.4.17 tailwindcss -c tailwind.config.cjs -i tailwind.input.css -o assets/layout.css --minify`.
- `assets/fonts`: bundled Nunito and Noto Sans Devanagari, with OFL licenses. Tailwind's MIT license is included in `assets`.

## Verification

- 84 real Chromium page checks across desktop (1440px) and phone (390px), light and dark modes: no JavaScript page errors or horizontal page overflow.
- Dashboard, classroom tools, profile and mobile layouts visually reviewed.
- Phone drawer navigation, assignment creation/publication and local Hindi font loading checked in Chromium.
- Profile opening, note saving and Escape dismissal checked in Chromium.
- Existing render, assignment-flow, account-role and learner-isolation checks pass.

Live Supabase authentication was not retested against a hosted project. Classroom data remains browser-local as documented in SETUP_SUPABASE.md.
