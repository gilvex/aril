# Pomegranate Planning Studio

A local, persistent planning space for Pomegranate: a future self-hostable, open-source deployment platform with a managed SaaS offering.

## Run

Requires Node.js 24+ and pnpm 11.

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:5173. The local API runs on port 4317. For a built application:

```sh
pnpm build
pnpm start
```

Then open http://127.0.0.1:4317. Run commands from this repository's root.

## What works

- Four editable starter diagrams: deployment blueprint, platform architecture, first deployment, and product structure.
- Drag nodes, connect handles, label connections, create boards, duplicate/delete nodes, and attach requirements.
- Fifteen requirements derived from the product brief, with priorities, status, acceptance criteria, filtering, and links back to boards.
- A design board with saved accent, density, and direction controls, plus an interactive sample interface.
- Project notes, autosave, undo/redo, JSON import/export, and restoration of the last 30 saved revisions.
- Responsive navigation and canvas controls, labeled inputs, keyboard focus handling, and reduced-motion support.
- Invite-only multiplayer: editable names and pictures, live cursors and selections, shared edits, and a durable team activity feed.
- Create and switch between private workspaces; accept invitations into an existing profile. Documents, history and live presence are isolated per workspace.
- Optional Google account linking retains invited users' workspace access across devices once the host configures a Google client ID.

Select a node to edit it. Drag from its right handle to another node's left handle to connect them. Use the canvas controls to zoom or fit the diagram. Ctrl/Cmd+Z undoes a change; Ctrl/Cmd+Shift+Z redoes it. Ctrl/Cmd+S saves immediately when focus is outside a text field.

Hold **Ctrl** (or **Cmd** on macOS) and click nodes to add/remove them from the selection. Drag any selected node to move the whole group. **Shift + drag** selects an area. The group inspector can change the selected nodes' type or decision together, or delete them and their attached connections. Each group operation can be undone.

Use **Fullscreen** beside Add node to expand the canvas. **Exit fullscreen** or **Esc** returns to the workspace. The editor keeps the same graph, selection, and zoom while switching; browsers that disallow native fullscreen use an expanded viewport instead.

## Storage and recovery

The authoritative workspace lives in **`data/studio.sqlite`**, created on first start. It survives browser and server restarts. Each browser tab retains a recovery draft for edits awaiting a successful save. Independent changes merge by field; competing edits to the same field stop with an export/reload recovery prompt instead of silently overwriting work. Cameras and undo history are personal to each tab.

Use **Export** for a portable JSON backup: download it, copy it, or select the visible JSON directly. **Import** validates the entire graph before asking to replace the workspace. Revision history and Undo can recover replacements. Undo history lasts for the current page session; saved revisions survive restarts.

For a complete database backup, stop the server before copying the `data` directory (SQLite uses WAL files while running). Do not commit workspace data. `POMEGRANATE_DATA_DIR` overrides the storage directory; `PORT` overrides the production/API port. Development expects API port 4317 unless the Vite proxy is also changed.

## Scope

This is the first planning deliverable, with separate workspaces for invited collaborators. It does not execute deployments or manage actual containers. Design-board service states are labeled sample data. All members can edit and invite others within their workspaces; there are no granular roles, account passwords, or member-revocation controls yet.

See [workspaces, Google accounts and deployment requirements](docs/accounts-and-deployment.md). Google requires host configuration. The current persistent SQLite and SSE backend cannot be deployed unchanged to Vercel Functions.

Click your profile at the top right to change your name or picture. Open **People → Create invite link** to invite someone; each link works once and expires after 24 hours. Profiles persist in this browser for 30 days. Both servers bind to loopback by default, so another device needs a hosted studio address. See [collaboration and hosting](docs/collaboration.md) for setup and recovery.

React + TypeScript + Vite support the interactive editor; React Flow provides the canvas; Express and Node's native SQLite provide local persistence. This choice is for the studio. The deployment product's backend, orchestration engine, and final framework remain open decisions.

## Checks

```sh
pnpm lint
pnpm test
pnpm build
```

Integration tests exercise real HTTP requests, two live event streams, and temporary SQLite databases: invite/session checks, independent edits, conflicts, profiles, cursors, activity, reconnects, persistence, invalid graphs, origin restrictions, and history. See [verification notes](docs/verification.md).

## Project documents

- [Product brief and next milestones](docs/product-brief.md)
- [Studio architecture](docs/architecture.md)
- [Design direction](docs/design.md)
- [Installed skills and provenance](docs/skills.md)

The project-local Juxtopposed-inspired skill is unofficial; it is not a skill authored or endorsed by Juxtopposed. The open-source license for Pomegranate is still to be selected.
