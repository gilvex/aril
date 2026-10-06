# Verification

Verified locally on 2026-10-05 with Node 24 and the Codex embedded browser.

## Automated checks

- TypeScript compilation and production Vite build.
- ESLint.
- Real HTTP/SQLite integration test: initial seed, saved notes and positions, stale-write rejection, dangling-edge rejection, foreign-origin and foreign-host rejection, historical snapshot retrieval, and persistence after closing/reopening the database.

## Browser checks

- Created a temporary board, added and duplicated a node, connected their handles, and confirmed both nodes and the edge survived a page reload.
- Edited a node title, linked a requirement, and confirmed persistence.
- Deleted the temporary board, undid deletion, and redid deletion; four starter boards remained.
- Used keyboard Delete on a connected node: its two connections were removed together. Undo restored all seven nodes and six edges.
- Restored a saved revision and undid the restore successfully.
- Searched requirements for sessions and inspected its acceptance criteria and board links.
- Opened the design study and switched sample tabs.
- Changed accent and density on a 390 × 844 viewport, reloaded, and verified both persisted. Restored the original choices afterwards.
- Checked mobile navigation and absence of document-level horizontal overflow on the design page. Reviewed desktop layout at 1440 × 960; reset the viewport override afterwards.
- Read and parsed JSON from the export dialog: four boards and fifteen requirements. Imported that document through the browser file chooser and replacement dialog successfully.

## Canvas multi-selection and fullscreen update

- Verified Ctrl-click selects two nodes and exposes the group inspector.
- Dragged one selected node: both moved by the same offset and the other five nodes stayed fixed. One Undo restored both original positions.
- Changed both selected nodes' decision status through the group inspector and observed both labels update.
- The browser tab was behind the latest server revision; stale-write protection rejected these temporary edits and preserved the newer saved workspace. Subsequent testing used a separate database on port 4318.
- Added native fullscreen with an expanded-viewport fallback, an exit control, and Escape handling. The embedded browser's native reload confirmation blocked further input, so fullscreen entry/exit and persistence of the new group operations were not fully verified in that browser session.
- Replaced the reload confirmation with an in-app dialog and bypassed the redundant unload warning after explicitly discarding edits. Build, lint, and the existing storage integration test pass.

## Browser export limits

The embedded browser did not report a completed file download. The export dialog therefore also exposes selectable JSON and a copy action. The copy action reported success, but the automation clipboard read returned empty, so clipboard contents were not independently verified. Import was verified using the exact JSON displayed in the export dialog. Download behavior in an external browser remains unverified.

## Invite-only multiplayer update

- Automated tests pass for two authenticated live streams, single-use invitations, cookie and bearer sessions, profile/avatar updates, cursor/selection events, independent concurrent changes, conflicting writes, invalid graphs, request deduplication, disconnect/reconnect, and SQLite persistence. Inverse-operation checks verify personal undo preserves unrelated collaborator changes and cameras stay local.
- Tested two independent browser origins against a separate SQLite database on port 4318. Joined through a generated invitation, changed a display name, uploaded a picture, and confirmed the saved picture loaded after reload.
- Edited separate nodes from both browsers; each received the other's edits and named activity entries. Undo restored only the initiating user's node title and preserved the collaborator's title.
- Confirmed named remote cursors and selection markers, including while the canvas was fullscreen. Entered and exited fullscreen successfully.
- Checked profile editing at 390 × 844; the dialog and toolbar fit. Reset the temporary viewport afterwards.
- Confirmed the actual studio's profile survives reload. Preserved its database; backed up the previous single-user recovery draft before continuing with the saved workspace.
- Screenshot: `artifacts/studio-multiplayer.jpg` shows the isolated two-user test workspace and shared activity.

These checks do not constitute a complete accessibility audit, cross-browser/load-test matrix, remote HTTPS deployment test, or validation of an actual deployment engine. The current server remains bound to loopback.

## Live drag update

- Extended the real HTTP/event-stream test with grouped drag previews, invalid-coordinate rejection, monotonic presence ordering, clearing previews, and confirmation that presence frames do not change the saved revision.
- Dragged two selected nodes in an isolated two-browser workspace. Both recipients reached identical final positions; other nodes stayed fixed. One Undo restored both positions in both browsers and enabled Redo.
- Fixed React Flow's temporary dragging flag entering undo history. Only position changes enter the document.
- Receiver positions are interpolated through React Flow, so edges, selection labels, and the minimap use the same coordinates. Reduced motion bypasses interpolation.
- Build, lint, and integration tests pass. Screenshot: `artifacts/live-drag.jpg`.

## Connection selection and tab presence

- Extended event-stream checks for selected connection IDs and clearing selections when changing pages, without changing the saved revision.
- In two isolated browser sessions, selecting a connection changed the peer's line to the selector's blue color and a 3 px stroke. Navigating to Project notes cleared the outline and moved the avatar to that page.
- Moving to Platform architecture showed the member's avatar in both the sidebar board entry and the top board tab. Both initial avatars also appeared on the shared board. Screenshot: `artifacts/connection-presence.jpg`.
- Selected the same connection, then the same node, from two independent browser sessions. Both screens showed both names and avatars, with their own identity marked “you.” Deselecting from one session retained the other member's badge. Workspace revision remained unchanged. Screenshots: `artifacts/shared-line-selection.jpg` and `artifacts/shared-node-selection.jpg`. Lint and build pass.

## Requirements presence

- Two isolated browser sessions selected R01; both names appeared in the requirement row and detail panel. Typing in its description produced a live typing badge and a colored field outline for the peer, then returned to an editing badge when idle. Saved description changes also arrived in the peer's form.
- Changing status showed “Editing status.” Closing the requirement and navigating to Project notes cleared that member's requirement badge while retaining the other member's selection.
- Extended the event-stream integration test to cover simultaneous requirement selection, field/typing state, invalid field rejection, and clearing one user's presence without changing the saved revision.
- Lint, build, and integration tests pass. Screenshot: `artifacts/requirements-presence.jpg`.

## Workspaces and account linking (2026-10-05)

- `pnpm lint`, `pnpm test` (7 tests), and `pnpm build` pass.
- New tests cover additive legacy migration, retained memberships, blank new workspaces, denied non-member API access, scoped history/activity/receipts, cross-workspace SSE broadcast isolation, one-use invitations into an existing profile, durable Google subject bindings, replay-protected challenges, and invalid credential rejection.
- Browser verification on an isolated database: created Game server blueprints, edited its description, switched away and reopened it; the edit persisted at revision 2. The profile panel correctly reports Google setup is pending.
- Live local migration: backed up the database under data/backups before restarting; original and migrated document bodies matched exactly at revision 106, with all 3 existing profiles enrolled in Pomegranate. Existing 4 boards and 15 requirements opened correctly. No test workspace was added to the user's live data.
- Screenshot: artifacts/workspaces-live.png. The workspace picker remains open at http://127.0.0.1:5173/.
- Google end-to-end authentication is not verified: no Google OAuth client is configured. GitHub repository creation is blocked by missing CLI/browser authentication. No Vercel deployment was created; persistent cloud storage and distributed realtime are not yet provisioned/implemented.

## Supabase migration and Vercel deployment (2026-10-05)

This update supersedes the deployment blockers recorded above.

- Created the private `gilvex/pomegranate` repository and deployed the studio to `https://pomegrenate.vercel.app`. Production health responds 200; unauthenticated session lookup responds 401. The Google client ID is configured and the Google button renders in the hosted profile panel. Real-user Google linking/sign-in remains an interactive check.
- With explicit user approval, backed up and transactionally migrated both workspaces, all three profiles, documents, history, memberships, Google bindings, invitations and hashed sessions. Verified document bodies/revisions and profile counts. Local development now uses the same Postgres store.
- Opened the existing local profile using the one-use hosted access flow. The hosted UI retained the profile and its workspace membership, and opened the original four boards and fifteen requirements at revision 106.
- Ran the real Supabase two-instance integration test in its own temporary schema: concurrent merges, deduplication, invitation races, isolated access, shared presence, one-use transfers and anonymous schema exclusion passed.
- Ran `scripts/smoke-cloud.ts` against the production URL: account transfer/replay rejection, workspace creation, non-member denial, invitation/replay rejection, two live event streams, cursor broadcast, durable edits and reconnect passed. Removed all generated test profiles and the temporary workspace; existing user workspaces were not edited.
- `pnpm lint`, `pnpm test` (7 passed, separate Postgres test skipped without its explicit environment setting), and `pnpm build` passed. The production backend is bundled separately to avoid Vercel TypeScript module-resolution failures.
- Screenshot: `artifacts/hosted-studio.png` shows the hosted saved canvas and profile with Google linking available. Production load testing and an actual Google authentication round trip are not covered by these checks.

## Per-board wireframes (2026-10-05)

- Added backward-compatible wireframe graphs, normalized per-block collaboration operations, screen parent validation, and private wireframe cameras. Tests cover concurrent first edits, independent resize/text edits, conflicting text edits, deletion with attached flows, inverse undo, import round trips, and invalid parents/edges/sizes.
- Extended real HTTP/SSE verification to save wireframes, observe them from another session, receive wireframe selections/drag previews and retain interaction labels after reopening SQLite. Nine default tests pass; the Postgres test remains explicitly opt-in.
- In an isolated browser-test database, created two screens and a button-to-screen interaction. Preview followed “Create server” to “Configure server.” Reload retained the wireframes while Blueprint kept its original graph. Numeric resizing and corner resizing both worked.
- Two independent browser origins showed the same resized block and both selection badges. Ctrl-click selected a card and button; dragging moved both by the same offset in both sessions. Undo restored the group. Fullscreen entered and exited successfully.
- Verified the toolbar, palette and inspector in a 390 × 844 iframe viewport, with no document-level horizontal overflow. Newly added screens were centered automatically; the temporary addition was undone. This checks responsive layout, not a real-device touch matrix.
- The deployment smoke script additionally exercises wireframe saves, shared wireframe presence and reconnects against a supplied hosted origin, using generated fixtures only.

## Dark appearance (2026-10-06)

Lint, the existing test suite (20 passed, optional Postgres test skipped), and production build pass. Browser checks use an isolated SQLite fixture: desktop blueprint, node inspector, requirements, design study and recipe wireframe preview; 390px mobile More sheet; Light/Dark/System selection; saved Dark survives reload. No production planning content is used as a test write target.

## MCP and planning skill (2026-10-06)

- Lint and production build pass. The normal suite passes 22 tests; the optional Postgres suite also passed separately against a generated isolated schema, including agent edits and cross-instance revocation. Live planning documents were not used as fixtures.
- A real MCP SDK client launched the stdio server and read/edited a temporary studio. Checks cover readonly and workspace isolation, expiration, revocation, credential ownership, blocked account routes, stale revisions, idempotent retries, invalid graphs, activity/history, and hashed credential storage.
- Browser verification on a separate SQLite fixture: desktop Agent access opens, creates a read/write connection and revokes it. Mobile More exposes the same dialog and fits at 390px width. The companion skill passes the official quick validator.
- Connection uses local stdio plus HTTPS API access; remote OAuth MCP clients are outside this implementation.

## pnpm monorepo (2026-10-06)

- Moved the studio to apps/studio and created packages/domain, packages/mcp, and packages/studio-skill with workspace dependencies and one lockfile. Frontend asset hashes are unchanged after the move.
- Root lint, tests (22 passed, optional Postgres skipped), and all package builds pass. The Postgres suite also passed separately in an isolated schema.
- Root pnpm dev was exercised with isolated SQLite storage: Vite and the API proxy responded successfully. Root pnpm start served the built frontend and healthy API; both processes wrote only to their specified repository-root artifacts directories. Both test servers were stopped. The Vercel API bundle imports successfully.
- Both MCP source and built executable read the live workspace at revision 166 without changing it. Updated the existing Codex registration to packages/mcp/src/index.ts, preserved the private credential, and verified the relocated skill installer.

## FSD and Redux/Saga refactor (2026-10-06)

- Verified the official installed FSD skill against upstream master `fd71da42a89e916f2ced63e5349fd865c87070a6`; its files already match. Added the user’s conventions to AGENTS.md and docs/code-rules.md, with architecture checks included in lint.
- Split components, utilities and types into camelCase/PascalCase files and public index barrels across the frontend, shared domain, MCP and server helpers. The architecture check covers 483 maintained source files and checks layer direction, slice public imports (including lazy imports), naming, component/function counts, type files and the four documented browser-state exceptions.
- Named Redux models now own application/editor/form state. Saga iterators cover revision-safe autosave/reload, debouncing, workspace listing/creation, hosted handoff and cancellable live connection setup/retry. Canvas selections are serializable arrays with Set selectors. Graph rendering remains lazy-loaded.
- Lint and all package builds pass. The default test run passes 27 tests; the opt-in Postgres test also passes separately in a generated temporary schema. Five new Redux regression tests cover coalesced writes, edits during a save, stale destructive draft recovery, collaborator-safe undo, and isolated multi-selection models. MCP stdio credential/scope/revocation checks pass after restoring the explicit executable export.
- Browser checks used a separate SQLite fixture: edited a node and confirmed it survived reload; created a wireframe screen; switched between Blueprint and Wireframes while retaining fullscreen; filtered and selected a requirement with presence badges; switched workspaces and created a new workspace through the Saga workflow. The final production build loads both editors successfully. Screenshot: artifacts/refactor/requirements-redux.png.
- No live document migration or reset was performed. Existing routes, database locations, session credentials, and installed companion skill remain compatible. The public MCP executable remains packages/mcp/src/index.ts.
