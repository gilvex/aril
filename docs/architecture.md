# Planning studio architecture

## Stack and boundaries

The studio is an interactive React application built with Vite and TypeScript. React Flow supplies graph interaction; Express persists validated workspaces in SQLite or Postgres. SQLite self-hosting requires no hosted database. Vercel uses Supabase Postgres through a server-side pooled connection; fonts are bundled locally.

For this editor, SSR and content-oriented rendering are not current requirements. Vite keeps the development and self-hosted runtime small. Next.js and Astro remain possible choices for later product surfaces; choosing Vite for the studio does not settle the final platform's framework.

The frontend follows the project conventions in [code-rules.md](code-rules.md):

- `app`: startup, authentication/route restoration, and global styles.
- `pages/studio` and `pages/workspaces`: page composition and navigation models.
- `widgets/board`, `widgets/requirements`, `widgets/design`, and `widgets/collaboration`: editors with their own Redux models.
- `features`: board navigation, canvas fullscreen, appearance, Google sign-in, agent access, and live sessions.
- `entities/workspace`: document state, revision-safe autosave, undo/recovery, and Saga iterators.
- `entities/collaboration`: shared profile avatars. Canvas selection/cursor presentation stays in the board widget; requirement presence stays in the requirements widget, keeping React Flow out of the initial page bundle.
- `shared`: transport, browser integration, routing utilities, and theme primitives.
- `packages/domain`: schemas and pure operations, with one function/type per file and public module index barrels.
- `packages/mcp`: stdio bridge, requests, configuration utilities, and types.

Slices use `ui`, `model`, `utils`, and `types`; model segments separate Redux slices, selectors, requests, Saga iterators, and lifecycle watchers. Import another slice through its root index. Graph editors remain lazy-loaded. Do not create empty layers or segments.

Redux stores are scoped to the mounted app, workspace session, editor, or form. Model hooks subscribe using React's `useSyncExternalStore`; stable commands dispatch named slice actions. UI state factories live beside the model. Selections serialize as arrays, with memoized Set selectors for React Flow. Store instances and developer instrumentation never retain the one-time agent credential. React Flow instances and interpolated animation frames remain local rendering state.

Autosave uses a Saga debounce and generator workers for commit/reload. Resetting debounce does not cancel an in-flight database commit; edits made while saving are drained in revision order. Workspace listing/creation and hosted handoff use request functions and Saga iterators. Live WebSocket setup/retry has a cancellable Saga lifecycle; the underlying signed presence protocol and authoritative document event stream remain unchanged.

## Persistence

Both stores hold isolated workspaces and up to 30 prior revisions each, plus profiles, hashed sessions/invites, change receipts, and the last 200 activity entries per workspace. The UI sends field-level operations against a normalized document indexed by entity IDs. The server checks each operation's prior value, validates the resulting graph, and commits a snapshot, receipt, and activity atomically. Independent edits merge; a competing field edit receives HTTP 409. Postgres adds row locks and bounded compare-and-swap retries across function instances. The browser rebases pending edits onto incoming snapshots and preserves conflicting drafts for export. Legacy full-workspace PUT retains revision comparison.

The current schema includes boards, node positions and metadata, edges, canvas viewports, requirements, notes, and design preferences. Each board can additionally contain a `wireframe` graph with sized blocks, optional screen parents, and labeled interaction edges. Its schema is optional for backward-compatible old documents and snapshots. The collaboration document normalizes missing wireframes into empty node/edge maps so two first-time edits merge by block. Only top-level screen parents are allowed; dangling edges, invalid sizes, and duplicate IDs are rejected. Both canvas viewports stay local. Imports use the same schema. The format carries `schemaVersion: 1`; incompatible format changes need explicit migration.

Server-sent events carry authoritative snapshots, transient presence, and the latest 50 activity entries. Authenticated fetch streaming supports a session header as well as cookies. Reconnects receive a fresh snapshot. SQLite presence is held in memory. Hosted presence uses transient Supabase WebSocket channels; saved document events use revision polling. Presence disappears on disconnect or expiry. Canvas coordinates are world coordinates; cameras remain local. Undo applies inverse local operations with preconditions, preserving unrelated collaborator edits. Text is merged per field, not per character; this is not a collaborative rich-text editor. Large documents and production deployment state need further architecture work.

## Local API

| Method | Route                       | Contract                                                                      |
| ------ | --------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/api/health`               | Health response.                                                              |
| GET    | `/api/session`              | Current profile; first local visit creates the initial profile.               |
| POST   | `/api/join`                 | `{ token, name }`; consumes a single-use invite and creates a session.        |
| POST   | `/api/invites`              | Creates an invite valid for 24 hours.                                         |
| PUT    | `/api/profile`              | `{ name, avatar }`; PNG/JPEG/WebP data URL or empty avatar.                   |
| GET    | `/api/events?clientId=UUID` | Authenticated event stream, up to 64 simultaneous connections.                |
| POST   | `/api/presence`             | Board, view, world cursor, and selected node IDs; identity is server-derived. |
| PATCH  | `/api/workspace`            | `{ requestId, operations: [{ path, before?, after? }] }`; 409 on conflict.    |
| GET    | `/api/workspace`            | `{ workspace, revision, savedAt }`.                                           |
| PUT    | `/api/workspace`            | `{ workspace, revision }`; returns updated envelope; 400 invalid, 409 stale.  |
| GET    | `/api/history`              | Available previous revision numbers and timestamps.                           |
| GET    | `/api/history/:revision`    | Workspace snapshot; 404 if absent.                                            |

The server restricts API hostnames and browser origins to loopback plus an explicitly configured public origin, rejects oversized JSON, and disables API caching. Except health, session lookup, and joining, API routes require an invited session. All members have equal studio access. These endpoints are not the future deployment API promised by requirement R10.

## Operational behavior

`pnpm dev` starts both processes and shuts down the sibling if one exits. Vite proxies `/api` to port 4317. `pnpm build` emits a static frontend and a bundled Node API for Vercel; `pnpm start` serves it and the API together. SQLite data is outside the generated frontend bundle and ignored by Git.

Recovery drafts and cameras use per-tab sessionStorage; the opaque session fallback uses localStorage. Existing single-user drafts are offered for export before opening the shared document, never automatically pushed over newer saved work. Export before resolving a conflict if both versions matter. Saved revision history is bounded, not a substitute for independent backups. See collaboration.md for access and hosting details.
