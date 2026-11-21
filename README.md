# ORAYAH DYNAMIS

A responsive corporate website for **The Community Energy Ecosystem**, built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and Lucide. The interactive architecture is a responsive, keyboard-operable SVG, not a simulation or wiring diagram.

## Build

```sh
npm install
npm run build
```

Vercel publishes the generated `dist` directory. All imagery, fonts, and the downloadable three-page project brief are hosted locally.

## Explore

- Three user-controlled cinematic introductions and dedicated LUMEN, TAMID, and GRID division dialogs.
- Project vision, challenge, and solution accordions.
- Thirteen inspectable architecture components, separate toggles for power, telemetry, and control paths, a motion pause, and an expanded map view.
- Seven operating stages with arrow-key tab navigation.
- Two clearly illustrative load-allocation scenarios for six community applications.
- Intended sustainability benefits and an honest distinction between initial battery storage and future gravity/PCM research.
- An enquiry composer with validation, email-app handoff, downloadable `.eml` drafts, and a copy option.

## Contact configuration

Set `VITE_CONTACT_EMAIL` to the team's approved email address in the hosting environment and rebuild. The default brand address is `hello@orayahdynamis.com`. The frontend prepares an email; it **does not claim a message has been delivered**. Visitors review and send their enquiry in their own email app. Form contents remain in memory and are not added to a mailing list or analytics service.

## Design content

Section content and division details are in `src/lib/content.ts`. Component-level architecture notes are in `src/components/Architecture.tsx`. The hero landscape, battery installation, and controller close-up are illustrative generated photography, not photographs of an asserted ORAYAH deployment. LUMEN and community photography are sourced from Pexels (Quang Nguyen Vinh and Yunus Tuğ). Manrope is locally hosted under the SIL Open Font License in `public/fonts/OFL.txt`.

The PDF can be regenerated with `python scripts/create_brief.py` where Python Playwright and Chromium are installed. No Python dependency is required for the web build.

No deployment, customer, efficiency, or measured reliability claims are made. All voltage figures are proposed design targets.
