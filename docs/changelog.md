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

The configured local backend shares production Postgres. Use a built frontend with Vite preview and `/?demo=1`; do not start the live backend, reset data or run migration tools to capture media. The checked-in tour is an animated sequence of actual demo screenshots, not a continuous screen recording.
