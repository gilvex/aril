# Planning studio architecture

## Stack and boundaries

The studio is an interactive React application built with Vite and TypeScript. React Flow supplies graph interaction; an Express server persists validated workspaces in SQLite. No hosted vendor service is required at runtime. Fonts are bundled locally.

For this editor, SSR and content-oriented rendering are not current requirements. Vite keeps the development and self-hosted runtime small. Next.js and Astro remain possible choices for later product surfaces; choosing Vite for the studio does not settle the final platform's framework.

The frontend uses a small Feature-Sliced Design structure:

- `src/app`: entry point and global styles.
- `src/pages/studio`: the complete studio page, its state model, and its page-local UI.
- `src/shared/api`: transport and shared contract exports.
- `domain`: runtime schema and starter content shared with the server.
- `server`: HTTP boundary and persistence.

Avoid empty architectural layers. Extract reusable entities/features/widgets only when a second concrete use warrants the boundary. Page-local UI modules can collaborate within the same page slice. The graph editor is lazy-loaded.

## Persistence

SQLite holds one current workspace and up to 30 prior revisions, plus profiles, hashed sessions/invites, change receipts, and the last 200 activity entries. The UI sends field-level operations against a normalized document indexed by entity IDs. The server checks each operation's prior value, validates the resulting graph, and commits a snapshot, receipt, and activity atomically. Independent edits merge; a competing field edit receives HTTP 409. The browser rebases pending edits onto incoming snapshots and preserves conflicting drafts for export. Legacy full-workspace PUT retains revision comparison.

The current schema includes boards, node positions and metadata, edges, canvas viewports, requirements, notes, and design preferences. Links must reference existing nodes/requirements; identifiers are unique within their relevant scope. Imports use the same schema. The format carries `schemaVersion: 1`; future format changes need explicit migration.

Server-sent events carry authoritative snapshots, transient presence, and the latest 50 activity entries. Authenticated fetch streaming supports a session header as well as cookies. Reconnects receive a fresh snapshot. Presence is held in memory and disappears on disconnect. Canvas coordinates are world coordinates; cameras remain local. Undo applies inverse local operations with preconditions, preserving unrelated collaborator edits. Text is merged per field, not per character; this is not a collaborative rich-text editor. Large documents and production deployment state need further architecture work.

## Local API

| Method | Route                    | Contract                                                                     |
| ------ | ------------------------ | ---------------------------------------------------------------------------- |
| GET    | `/api/health`            | Health response.                                                             |
| GET    | `/api/session`           | Current profile; first local visit creates the initial profile.               |
| POST   | `/api/join`              | `{ token, name }`; consumes a single-use invite and creates a session.         |
| POST   | `/api/invites`           | Creates an invite valid for 24 hours.                                         |
| PUT    | `/api/profile`           | `{ name, avatar }`; PNG/JPEG/WebP data URL or empty avatar.                    |
| GET    | `/api/events?clientId=UUID` | Authenticated event stream, up to 64 simultaneous connections.             |
| POST   | `/api/presence`          | Board, view, world cursor, and selected node IDs; identity is server-derived. |
| PATCH  | `/api/workspace`         | `{ requestId, operations: [{ path, before?, after? }] }`; 409 on conflict.    |
| GET    | `/api/workspace`         | `{ workspace, revision, savedAt }`.                                          |
| PUT    | `/api/workspace`         | `{ workspace, revision }`; returns updated envelope; 400 invalid, 409 stale. |
| GET    | `/api/history`           | Available previous revision numbers and timestamps.                          |
| GET    | `/api/history/:revision` | Workspace snapshot; 404 if absent.                                           |

The server restricts API hostnames and browser origins to loopback plus an explicitly configured public origin, rejects oversized JSON, and disables API caching. Except health, session lookup, and joining, API routes require an invited session. All members have equal studio access. These endpoints are not the future deployment API promised by requirement R10.

## Operational behavior

`pnpm dev` starts both processes and shuts down the sibling if one exits. Vite proxies `/api` to port 4317. `pnpm build` emits a static frontend; `pnpm start` serves it and the API together. SQLite data is outside the generated frontend bundle and ignored by Git.

Recovery drafts and cameras use per-tab sessionStorage; the opaque session fallback uses localStorage. Existing single-user drafts are offered for export before opening the shared document, never automatically pushed over newer saved work. Export before resolving a conflict if both versions matter. Saved revision history is bounded, not a substitute for independent backups. See collaboration.md for access and hosting details.
