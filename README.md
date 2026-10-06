# Aril Planning Studio

A persistent, collaborative planning space for Aril: a future self-hostable, open-source deployment platform with a managed SaaS offering. Previously named Pomegranate.

The product uses the Aril name and seed logo. Existing package names, environment variables, storage/session keys, database schema and MCP identifiers retain `pomegranate` for compatibility. Existing workspace names and user-authored documents are preserved. The current production URL remains https://pomegranate.gilgil.co until the new domain is configured.

The pnpm monorepo contains:

- `apps/studio` — React frontend and HTTP API.
- `packages/domain` — shared schemas and collaboration operations.
- `packages/mcp` — MCP server and connection setup.
- `packages/studio-skill` — companion skill and installer.

See [Monorepo layout and commands](docs/monorepo.md) for package boundaries and deployment details.

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
- Every board has a separate Wireframes section: resizable screen frames, text, buttons, inputs, cards, images and navigation blocks, labeled interaction arrows, and a click-through flow preview.
- Drag nodes, connect handles, label connections, create boards, duplicate/delete nodes, and attach requirements.
- Fifteen requirements derived from the product brief, with compact list/status/priority views, on-demand search and filters, removable filter chips, and links back to boards. Cards support drag-and-drop or a keyboard/touch Move to control; bulk edits stay in a separate bottom bar and identify selections hidden by filters. Details include acceptance criteria and live collaborator activity.
- A design workbench with saved accent, typography, density, and direction controls; desktop/mobile and light/dark sample previews with server, activity, and access screens.
- A searchable notebook with Markdown editing, split/reading views, heading outline, and links to boards and requirements. Existing project notes remain the first document. Autosave, undo/redo, JSON import/export, and restoration of the last 30 saved revisions cover every document.
- Responsive navigation and canvas controls, labeled inputs, keyboard focus handling, and reduced-motion support.
- Installable PWA with standalone mobile windows, home-screen icons and an offline reconnect screen. Use **Install app** in the workspace menu for browser-specific instructions. Opening and syncing workspaces requires a connection; shared documents and authenticated requests are never cached by the service worker.
- Invite-only multiplayer: editable names and pictures, live cursors and selections, shared edits, and a durable team activity feed.
- Create and switch between private workspaces; accept invitations into an existing profile. Documents, history and live presence are isolated per workspace.
- Optional Google account linking retains invited users' workspace access across devices once the host configures a Google client ID.

Select a node to edit it. Drag from its right handle to another node's left handle to connect them. Use the canvas controls to zoom or fit the diagram. Ctrl/Cmd+Z undoes a change; Ctrl/Cmd+Shift+Z redoes it. Ctrl/Cmd+S saves immediately when focus is outside a text field.

Hold **Ctrl** (or **Cmd** on macOS) and click nodes to add/remove them from the selection. Drag any selected node to move the whole group. **Shift + drag** selects an area. The group inspector can change the selected nodes' type or decision together, or delete them and their attached connections. Each group operation can be undone.

Use **Fullscreen** beside Add node to expand the canvas. **Exit fullscreen** or **Esc** returns to the workspace. Fullscreen stays active when switching boards, switching between Blueprint and Wireframes, or opening board dialogs. The editor keeps the same graph, selection, and zoom when entering or leaving fullscreen; browsers that disallow native fullscreen use an expanded viewport instead.

Choose **Wireframes** below the board tabs to sketch its interface. Start with a screen or add individual blocks. Selecting a screen before adding a block places it inside that screen; **On screen** can change its parent later. Move frames using their title bars, resize selected blocks from their corners or numeric dimensions, and Ctrl/Cmd-click to move or style several together. Connect either side or choose a destination under **What happens next?**. Arrows automatically leave and enter on the sides facing the destination, so return flows can leave from the left. Select an arrow to change its label or destination. **Preview flow** lets you click a connected block and follow its destination. **Edit** or Escape returns to editing. Wireframes share autosave, history, undo, import/export, cursors, selections and live drag previews with the rest of the studio.

Wireframe arrows route around surrounding blocks and screens, with separate arrival points for flows sharing a destination screen. Zoomed-out arrows use numbered badges matching the **Flows** list; select a badge or list entry to read the interaction and dim unrelated connections. Routing follows live movement without changing the saved layout.

Use **Appearance** in the desktop workspace actions menu (…), mobile **More** sheet, or workspace chooser to select **Light**, **Dark** or **System**. Your choice stays in this browser, including across refreshes and tabs; System follows your device appearance.

## Storage and recovery

The authoritative workspace lives in **`data/studio.sqlite`**, created on first start. It survives browser and server restarts. Each browser tab retains a recovery draft for edits awaiting a successful save. Independent changes merge by field; competing edits to the same field stop with an export/reload recovery prompt instead of silently overwriting work. Cameras and undo history are personal to each tab.

Use **Export** for a portable JSON backup: download it, copy it, or select the visible JSON directly. **Import** validates the entire graph before asking to replace the workspace. Revision history and Undo can recover replacements. Undo history lasts for the current page session; saved revisions survive restarts.

For a complete database backup, stop the server before copying the `data` directory (SQLite uses WAL files while running). Do not commit workspace data. `POMEGRANATE_DATA_DIR` overrides the storage directory; `PORT` overrides the production/API port. Development expects API port 4317 unless the Vite proxy is also changed.

## Scope

This is the first planning deliverable, with separate workspaces for invited collaborators. It does not execute deployments or manage actual containers. Design-board service states are labeled sample data. All members can edit and invite others within their workspaces; there are no granular roles, account passwords, or member-revocation controls yet.

See [workspaces, Google accounts and hosting](docs/accounts-and-deployment.md). Google requires host configuration. Vercel uses the Postgres backend and shared presence; self-hosted installations can continue using SQLite. Set `POMEGRANATE_STORAGE=postgres` locally to share the cloud database.

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

## MCP and companion skill

Other chats can read and edit a workspace through the local MCP server and Pomegranate studio skill. Open **Workspace actions → Agent access** to create a scoped credential, then follow [Agent integration](docs/agent-integration.md). Agent edits use the same freshness checks, history, and live updates as browser edits.

Code structure and state conventions: [Code rules](docs/code-rules.md) · [Architecture](docs/architecture.md). `pnpm lint` enforces the FSD boundaries and file conventions through `pnpm check:architecture`.
