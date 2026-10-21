# Changelog and product media

The public `/changelog` page is readable without an account. Links appear on sign-in and in Settings → App. Workspace links open a new tab so unsaved work and the camera stay in place.

## Shipping a change

1. Add or update a dated entry in `apps/studio/src/pages/changelog/config/releases.ts`, newest first. Use a stable unique ID for shareable anchors. Group related changes from the same delivery; don't invent versions or historical dates.
2. Describe the shipped behavior and any material limitation. Include fixes and removals as well as features. Link a verified commit when one exists. Do not describe previews or future plans as released features.
3. Add each title, summary, bullet and image description to both `shared/i18n/locales/en.json` and `ru.json`.
4. Capture visual changes in the isolated demo or generated fixtures. Never capture live private workspaces, credentials, invitation links, or real account details. Save optimized screenshots under `apps/studio/public/changelog/` with descriptive names and alt text. Keep existing release screenshots unchanged.
5. Update the README tour when a major workflow changes. The README and changelog share the same public media files. Keep the GIF short and small, use real UI captures, label simulated content, and retain static screenshot alternatives.
6. Run `pnpm lint`, `pnpm test`, and `pnpm build`; check the page at desktop and mobile sizes, screenshot links, direct release anchors and language switching.

The initial entries are a curated record of the recent Library work, not a complete reconstruction of every historical commit. Future user-facing releases should be recorded as part of their implementation. Internal maintenance can be summarized under the relevant release without a new screenshot if the interface has not changed.

## Capture safety

The configured local backend shares production Postgres. Use a built frontend with Vite preview and `/?demo=1`; do not start the live backend, reset data or run migration tools to capture media. The tour is a continuous Playwright recording. The changelog uses MP4 with playback controls, posters and localized captions; the README GIF is encoded from that same recording. Do not substitute a screenshot slideshow for a workflow recording.

## Record a workflow

Build the frontend, then start Vite preview on `127.0.0.1:4173`. Install the matching browser once with `pnpm exec playwright install chromium`, then run `node scripts/recordDemo.mjs`. The script creates a fresh, headless demo context, blocks external and API requests, adds a visible recording pointer and writes a continuous WebM plus timing markers under ignored `artifacts/demo-recording/`. It never uses an existing signed-in browser.

Trim setup time using the emitted markers and encode H.264 MP4 (`yuv420p`, `+faststart`). Export the README GIF from the same video at 12 fps with a generated palette; keep it under 10 MB. Add matching English/Russian WebVTT captions. Keep videos user-initiated with native controls, so readers can pause, seek or view fullscreen. Preserve static screenshots as posters and README alternatives.

The entry-flow capture uses `node scripts/recordEntry.mjs` after a build. It starts its own local preview, mocks all authentication APIs with fixtures, blocks external requests, and records real mouse interactions. Set `ARIL_FFMPEG` to an existing FFmpeg executable (or put `ffmpeg` on PATH); the script exports the screenshot, MP4, GIF and EN/RU captions under `apps/studio/public/changelog/studio-entry.*`.

For the invitations workflow, run `ARIL_CAPTURE_INVITATIONS=1 node --test scripts/invitations.browser.test.mjs` after building. (In PowerShell, set `$env:ARIL_CAPTURE_INVITATIONS='1'` first.) It records generated accounts with intercepted APIs, captures `account-invitations.png`, and prints the WebM path under `artifacts/invitations-recording/`. Encode that continuous recording to `account-invitations.gif` at 12 fps and 960px width; use a generated palette and retain the screenshot alternative.
