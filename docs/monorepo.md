# Monorepo

Pomegranate uses pnpm workspaces with one lockfile. Run commands from the repository root unless working on a specific package.

```text
apps/
  studio/                 @pomegranate/studio
    src/                  React/FSD frontend
    server/               HTTP API, persistence, integration tests
    public/               Static assets
    scripts/              Development and server build
packages/
  domain/                 @pomegranate/domain: shared schemas and operations
  mcp/                    @pomegranate/mcp: stdio bridge, setup, build
  studio-skill/           @pomegranate/studio-skill: SKILL.md and installer
scripts/                  Explicit administrator utilities
api/                      Vercel entry point for the studio API
docs/                     Product and engineering documentation
.agents/skills/           Installed development skills
```

## Commands

| Root command | Action |
| --- | --- |
| `pnpm install --frozen-lockfile` | Install all workspace dependencies |
| `pnpm dev` | Studio API + Vite at the existing local ports |
| `pnpm build` | Type-check domain, build MCP, build studio frontend/API in dependency order |
| `pnpm test` | Isolated studio/domain/MCP integration checks |
| `pnpm lint` | Lint maintained source across the workspace |
| `pnpm start` | Serve the built frontend and API together |
| `pnpm invite` | Explicit admin command using root environment and storage settings |
| `pnpm mcp` | Start the MCP server over stdio |
| `pnpm mcp:setup` | Connect MCP to a workspace using a private credential |
| `pnpm skill:install` | Install the companion skill for Codex |

Use filters for individual packages: `pnpm --filter @pomegranate/mcp build`, `pnpm --filter @pomegranate/studio test`, or `pnpm --filter @pomegranate/studio-skill install:skill`. pnpm's dependency ordering handles this small graph; a separate task orchestrator is not required.

## Package boundaries

The studio pins `vagabond-ui` to `0.4.0`. `shared/ui/StudioDrawer` applies Aril's scoped theme to the library's bottom Drawer and right-side Fridge; Vagabond owns drag gestures, motion, focus, scroll locking and dismissal. Mobile design tools, dialogs and collaboration panels use Drawer, and the workspace menu uses Fridge. Desktop windows retain their existing draggable behavior. `StudioActionBar` uses the library ActionBar and toolbar buttons for Blueprint, Wireframes, Design, and requirement bulk actions. Canvas bars stay inside their canvas rather than portalling to the document, preserving fullscreen and mobile positioning; Escape remains available to editor tools and menus.

`patches/vagabond-ui@0.4.0.patch` adds an optional `container` prop to `DrawerContent` (also inherited by Fridge) and forwards it to Radix Portal. This keeps overlays inside the current native fullscreen element. Remove the patch when upstream exposes the same API. No library interaction logic is copied into the application. The scoped CSS intentionally replaces the library's global stylesheet/reset to preserve the existing studio theme.

Studio and MCP both depend on `@pomegranate/domain` via `workspace:*`. Import shared contracts with `@pomegranate/domain/workspace`, `@pomegranate/domain/collaboration`, etc. Domain imports neither app code nor MCP. The studio's MCP dependency is development-only, used by the real stdio integration test. The skill package is independently installable and contains no credentials or runtime dependencies.

The shared domain exports TypeScript source intentionally: Node 24 executes workspace source through pnpm's local links, while Vite and esbuild bundle it into deployable output. Consumers never depend on a stale generated copy of the contract. All packages are private; pushing the repository does not publish them to npm.

## Environment, data, and deployment

Root `.env` is loaded explicitly by studio development/start commands. The default SQLite file remains `<repository>/data/studio.sqlite`, independent of the process working directory. Relative `POMEGRANATE_DATA_DIR` values are resolved from the repository root, as before. Root administrator scripts also keep their old environment/data locations. The restructure performs no database migration or reset.

Build output lives at `apps/studio/dist`, `apps/studio/.server`, and `packages/mcp/dist`. These directories are ignored. Root `api/index.js` forwards to the studio's bundled API; root `vercel.json` selects `apps/studio/dist` and includes the server bundle/certificate. The existing Vercel project stays rooted at the repository root and uses `pnpm build`, allowing it to access all workspaces.

Existing MCP clients should launch Node with the absolute path to `packages/mcp/src/index.ts` (or `packages/mcp/dist/index.mjs` after building). Re-register the same server name to update an older `mcp/index.ts` path. Keep its existing `POMEGRANATE_MCP_CONFIG` setting: credentials have not moved and do not need rotation. The skill source now lives in `packages/studio-skill/SKILL.md`; its installed name remains `pomegranate-studio`.
