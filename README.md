# Aril Planning Studio

A collaborative workspace for architecture diagrams, interface design, requirements, and notes. Built with React, TypeScript, and Express, with SQLite for single-process hosting and Postgres for shared deployments.

[Try the account-free demo](https://www.aril.studio/?demo=1) · [Open Aril](https://www.aril.studio) · [Engineering case study](docs/engineering-case-study.md) · [Changelog](https://www.aril.studio/changelog)

[![Verify](https://github.com/gilvex/aril/actions/workflows/ci.yml/badge.svg)](https://github.com/gilvex/aril/actions/workflows/ci.yml)

![Aril demo: architecture, interface design, and reusable assets](apps/studio/public/changelog/studio-tour.gif)

The recording uses editable demo fixtures and simulated teammates. Aril is a planning studio; it does not execute deployments. [Watch with playback controls](https://www.aril.studio/changelog#2026-10-11-changelog).

| Architecture and collaboration                                              | Interface design                                                        |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| ![Canvas with connected services](apps/studio/public/changelog/canvas.webp) | ![Desktop and mobile designs](apps/studio/public/changelog/design.webp) |

## What it does

- **Canvas and Design:** connected architecture boards, editable interface layers, nested frames, and dockable inspectors.
- **Library:** reusable components and variables with dependency/usage inspection.
- **Scope and Notes:** requirements, decisions, Markdown documents, and saved comments. Notes support concurrent text editing with Yjs.
- **Collaboration:** live cursors, selections, following, and previews; persistent edits use revision checks and recoverable conflict handling.
- **Access and recovery:** owner/editor/viewer permissions, expiring guest links, scoped agent credentials, personal undo, JSON export, and bounded saved revision history.

See the [studio guide](docs/studio-guide.md) for controls and recovery behavior.

## Engineering decisions

| Problem                                                 | Approach                                                                                      | Evidence                                                                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Concurrent edits must not silently overwrite work       | Revision-checked operations, field preconditions, atomic saves, and preserved recovery drafts | [Collaboration tests](apps/studio/server/collaboration.test.ts), [freshness tests](apps/studio/server/freshness.test.ts) |
| Multiple API instances share one document               | Postgres row locking, atomic history/receipts, and revision conflict handling                 | [Two-instance integration test](apps/studio/server/postgres.test.ts)                                                     |
| Cursor traffic should not become durable writes         | Transient presence, separated from authoritative document saves                               | [Architecture](docs/architecture.md), [hosting](docs/accounts-and-deployment.md)                                         |
| Browser and automation edits need the same access rules | Account or file-scoped agent credentials and shared validation/save paths                           | [Agent integration](docs/agent-integration.md), [access tests](apps/studio/server/workspaceAccess.test.ts)               |

[Case study: preserving edits across collaborators and storage backends](docs/engineering-case-study.md) explains the trade-offs, verification, and remaining limits. [Operations](docs/operations.md) covers health checks, backups, restore drills, and rollback.

## Run locally

Requires Node.js 24+ and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:5173; the API runs on port 4317. A fresh checkout without cloud configuration uses SQLite. See [hosting and accounts](docs/accounts-and-deployment.md) for Google sign-in and Postgres configuration.

```sh
pnpm build
pnpm start
```

The built application is served at http://127.0.0.1:4317. Run commands from the repository root.

## Verify

```sh
pnpm lint
pnpm test
pnpm build
pnpm benchmark:collaboration
pnpm verify:recovery
```

CI runs lint, fixture-based tests, and all package builds on Node 24. A separate job runs the two-instance Postgres integration test against a disposable PostgreSQL service. The local default test run skips that test unless `POSTGRES_TEST_URL` is provided. See [verification](docs/verification.md) for commands and the distinction between automated checks and historical manual observations.

## Repository map

- `apps/studio` — React editor and HTTP API.
- `packages/domain` — schemas and collaboration operations.
- `packages/mcp` — stdio MCP bridge.
- `packages/studio-skill` — companion integration skill.
- `docs` — architecture, operation, and contributor documentation.

[Contributing](CONTRIBUTING.md) · [Architecture](docs/architecture.md) · [Code conventions](docs/code-rules.md) · [Monorepo](docs/monorepo.md)

## Scope and limitations

Aril is the planning deliverable for a future deployment platform. Container execution, infrastructure reconciliation, enterprise SSO, and resource-level deployment permissions remain future work. The installable app provides an offline reconnect screen, not offline workspace editing. History is bounded and does not replace database backups. Performance experiments use local fixtures, not production traffic or an availability guarantee.

Packages now use `@aril/*`, the MCP connection is `aril`, and the companion skill is `aril-studio`. One account credential can access your files without reconnecting; file-only credentials remain available. New configuration uses `ARIL_*`; legacy environment aliases and saved MCP configuration remain readable. Existing database schemas, browser storage keys, and user documents are preserved. See the [agent setup and upgrade guide](docs/agent-integration.md).

Aril’s original code is licensed under [Apache-2.0](LICENSE). Third-party materials retain their own licenses; see [licensing and notices](docs/licensing.md) and [skill provenance](docs/skills.md).

The app includes a public `/legal` center with EN/RU drafts of Terms, Privacy, Cookies & Storage, and provider disclosures. Hosted policies are not yet effective. See the [legal readiness checklist](docs/legal-readiness.md) for the remaining operator, consent, transfer and retention work before adoption. Self-hosters must supply their own operator details and policies.
