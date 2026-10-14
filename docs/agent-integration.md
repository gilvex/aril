# Agents and the planning studio

Aril includes a local **MCP server** for live workspace access and a **companion skill** for planning and layout conventions. It works with the hosted studio and self-hosted installs. It reads and edits saved planning data; it does not execute infrastructure deployments. The MCP server is named `aril` and the companion skill is `aril-studio`.

## Connect Codex

Requires Node 24+ and this checkout with `pnpm install` completed.

1. Open the workspace. Choose **Settings → Agent access**.
2. Create a named credential with **Read only** or **Read and edit**, expiring in 7, 30, or 90 days. Choose **My account — all accessible files** to reuse one connection across your current and future files, or **This file only** to limit it to the open file. Every file retains its own permissions; account credentials cannot edit viewer-only files. The secret is displayed once; copy it locally, not into a chat.
3. In the checkout run `pnpm mcp:setup`. Enter the studio origin (e.g. `https://www.aril.studio`) and paste the credential at the hidden prompt. This verifies access and saves it outside the repository at `~/.config/aril/mcp.json`. On Windows, setup restricts the credential file ACL to the current user; on Unix, the directory/file modes are 0700/0600.
4. Run the `codex mcp add aril -- ...` command printed by setup. It contains only the Node executable and absolute server script path, never the credential.
5. Run `pnpm skill:install`. This installs the versioned skill from `packages/studio-skill/SKILL.md` to `$CODEX_HOME/skills/aril-studio` (or `~/.codex/skills`). It refuses to overwrite a different existing skill by default. To update an installed copy after reviewing differences, run `pnpm skill:install --update`; it backs up the previous file alongside it before replacing it.
6. Open a new chat. Ask: “Use Aril to find my project and read its deployment board.” The chat should first call `list_workspaces`, then pass the chosen `workspaceId` to its tools.

Keep this checkout available: the registered server runs `packages/mcp/src/index.ts` directly with Node. Update dependencies with `pnpm install` after pulling new versions. `pnpm mcp` is available for debugging, but MCP clients should launch Node directly to keep stdout free of package-manager output.

For another stdio MCP client, use its server configuration format with command = the absolute Node executable, args = the absolute path to `packages/mcp/src/index.ts`. The server reads the same saved configuration. For multiple connections, use a different MCP server name and set `ARIL_MCP_CONFIG` to a separate absolute credential-file path per server. If you use that variable during setup, also set it in the registered client's environment. Alternatively supply `ARIL_AGENT_ORIGIN` and `ARIL_AGENT_TOKEN` through the client's private environment/secret mechanism. The token is never a command-line argument.

This is **local stdio MCP**, with an HTTPS API bridge to Vercel; it is not a public remote MCP endpoint. Cloud-only clients that require a remote OAuth MCP URL need a separate transport/auth integration. No public `/mcp` endpoint is exposed by this implementation.

## What agents can do

| Tool            | Purpose                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `list_workspaces` | Accessible file IDs, names, roles and effective permissions |
| `get_workspace` | Workspace identity, revision, board overview, requirements, notes, design settings and page summaries; optional full graphs/layers |
| `get_board`     | Complete blueprint and wireframe plus browser link                                                        |
| `get_design_page` | One design page with complete layers, revision, defaults and a Design-section link |
| `get_schema`    | Current graph/document field types and limits                                                             |
| `get_history`   | Recent saved revisions and attributed activity                                                            |
| `apply_changes` | Atomic targeted edits to boards, nodes, connections, wireframes, requirements, notes, and design          |

Writes use the existing operation model: ID-addressed paths, exact `before` values, a required `baseRevision`, and an idempotency UUID `requestId`. Read responses use arrays; operation paths and whole-board values use ID-keyed collections. See the companion skill for examples. The whole document is validated before saving: dangling edges, unknown requirement links, and invalid wireframe parents are rejected. Up to 500 operations fit in one transaction. Request bodies are capped at 5 MB.

An agent edit increments the normal document revision, retains snapshots, appears in team activity as **connection name (agent · member name)**, and reaches connected browsers through the existing workspace stream. It does not write cursor/presence records or impersonate a human cursor. Lost-response retries with the same requestId do not apply a second time. A stale revision returns 409; agents must read and reassess, not replay blindly.

## Design canvas

`get_workspace` returns design settings and compact page summaries (`id`, `name`, `layers`, `frames`). Use `get_design_page` with a discovered `pageId` for the complete layer array, or `get_workspace` with `full: true` for all pages. The returned link opens the Design section; the page name identifies which page to select. Restart the MCP connection/open a new chat after updating this checkout to discover the new tool.

Edit a page at `["design", "pages", pageId]` or a layer field at `["design", "pages", pageId, "nodes", layerId, "text"]`. In operations, pages and nodes are ID-keyed objects, including whole-page `before` values. Older workspaces may omit `design.pages`; initialize that field only when absent, preserving all existing design settings. When pages already exist, add a single page by ID. The [companion skill](../packages/studio-skill/SKILL.md) covers initialization and layout rules.

Pages support up to 500 layers and the workspace up to 30 pages. Frames, rectangles, ellipses, text, buttons and HTTPS images use the same validated schema as the editor. Child coordinates are relative to a top-level frame; only frames can parent layers and frames cannot nest. Larger `order` values draw in front. Delete or reparent children with their frame in one batch. Cameras, active pages and selections are not document writes. No new credential, database migration or presence record is needed for this support.

The MCP integration tests create the first page in a legacy workspace, check compact/full reads, edit nested layers, and reject stale deletions, orphaned children, conflicting values and read-only writes. All run against temporary SQLite fixtures.

## Access and storage

Agent credentials are distinct from browser sessions. The database stores only a SHA-256 hash of the random 256-bit secret. Each credential includes an owner, an account or file target, permission, creation time and expiry. Account grants use a reserved `*` target in the existing credential table; no document or membership migration is needed. Existing rows remain file-only. Membership is checked for every file read and write and again when a write commits. Ordinary account, invitation, workspace-creation, and credential-management endpoints do not accept an agent credential. Members can list/revoke only credentials they created; creating one does not change membership.

Revoke a connection in **Agent access** to reject subsequent requests (an already-authorized request may finish). To rotate/renew, create a new credential, rerun setup, restart/reconnect the client, then revoke the old one. Closing the dialog clears its displayed secret; the browser does not persist it. File-only credentials for different workspaces need separate configurations; account credentials use one connection for all accessible files. Keep the local credential directory out of sharing/backups intended for others.

The new `agent_credentials` table is additive in SQLite and Postgres. No studio document or membership is reset. Credential reads do not update last-used records or create document revisions. No database or Supabase service key is needed by the MCP client.

## Validation

`pnpm test` covers an actual SDK client/stdio server handshake, reads and edits against a temporary SQLite instance, scope/expiry/revocation, account-route isolation, ownership checks, stale writes, idempotency, graph validation, history attribution, and absence of plaintext tokens in the database. The optional `POSTGRES_TEST_URL` suite uses an isolated schema and verifies cross-instance credential access/revocation. Never use production planning documents as test fixtures.

## Notebook paths

The original note remains accessible through `["notes"]`, and its optional title through `["notesTitle"]`. Additional notebook entries are returned in the `documents` array; operations address them by ID: `["documents", id]`, `["documents", id, "title"]`, or `["documents", id, "body"]`. Creating an entry supplies `{ id, title, body }`; `project-notes` is reserved for the original note. IDs are limited to 90 characters, titles to 120, and bodies to 50,000. Current schema is available through `get_schema`. Legacy notes edits preserve additional documents.

Board-specific designs use `get_design_page({ boardId, pageId })` and operation paths under `["boards", boardId, "design", "pages", pageId]`. `get_workspace` lists each board's sections and design page summaries. Boards may set `sections` to an ordered subset of `canvas`, `wireframes`, and `design`; the first is primary. Omitted sections preserve legacy Blueprint + Wireframes behavior. Initialize missing board design settings and ID-keyed pages before adding layers. Workspace designs remain independent.

Browser write protocol 3 protects these new fields from older bundles. Existing connections should restart their MCP process after updating the bridge. Credentials do not need to be recreated.


Scope retains the `requirements` API path. `get_schema` exposes optional decision, workspaceWide, questions and links fields; `get_workspace` includes them in both compact and full reads. See the companion skill for link destinations and array conflict rules.


Shared field edits now appear in browsers as transient signed live previews before autosave. MCP reads still return the authoritative saved revision, not another member's unsaved field draft. Re-read before applying a targeted change, and keep existing revision/conflict checks. Field focus, selected text ranges and cursor positions are ephemeral presence, not writable workspace fields; do not synthesize human presence or publish live preview packets through agent tools.


### Design Library

`get_design_library({ boardId? })` reads components/variants, variable collections/modes and archived legacy records for workspace Design or one board design. `get_workspace` includes compact library summaries; `full: true` includes full definitions. Saved edits still use `apply_changes` and the current revision. Variant nodes, like page nodes, are addressed by ID in operations.

Component master edits synchronize instance fields that are not listed in per-node `instance.overrides`. Variable bindings resolve locally for the selected collection mode. State machines are retired from the UI and active usage results; existing definitions are preserved as archive data. The companion skill documents schema paths, reference constraints, and safe editing examples. Existing designs need no data migration; Library is optional.

### Clustered Library map

Library offers Browse, Variables and Map. Map opens libraries, then families, then individual assets. It draws at most 24 primary items and 12 connected external groups per page; pagination, the catalog and search retain access to the complete inventory. Browse shows 60 assets per page and supports selecting multiple assets for organization. Select an asset for direct usages, dependencies, variant previews and indirect impact; Focus connections explores one or two levels with incoming/outgoing filters. Drag nodes to arrange them. Opening or closing details does not refit the map; changing its scope does. Mobile asset details use the shared drawer.

Components and variables may store optional `organization: { library, family }` strings. Library is organizational metadata within the current design source, not a new access boundary or a cross-workspace published package. Existing assets receive virtual defaults without data migration: Foundations and Core UI; variable collections and slash-separated names supply families. Pages remain in Pages. Use the details form to assign or create library/family names; bulk changes preserve asset IDs and bindings. Workspace and board sources remain separate. Cross-workspace publishing/versioning is not implemented.

The per-design schema allows 2,000 components, 5,000 variables and 200 variable collections; existing page/variant/layer and request-size limits still apply. Large variable tables start with 50 rows and expose Show more. MCP `find_design_assets` includes effective organization, searches its text, and accepts exact `libraryName` and `family` filters alongside kind/type/usage and pagination.

### Library map and icons

The usage map uses compact symbols, consistent spacing and curved links anchored outside node bounds. Focus arranges dependencies to the left and usages to the right. Selecting an asset dims unrelated nodes to 10% without rearranging the map; entering a scope fits the view with a short reduced-motion-aware transition. Search, cluster drill-down and bounded pagination remain available for large libraries.

Component icons default to a miniature outline derived from the first variant’s visible geometry. Set the component `icon` to an emoji or short symbol to override it, or clear it to restore automatic shape rendering. The Library details panel offers both choices. State machines and the Behaviors group no longer appear in Library, Design modes, asset search or active usage counts. Historical machine records remain stored for export/round-trip compatibility and no longer constrain edits to active assets.

## Account access and upgrading older connections

Call `list_workspaces` to discover IDs, names, roles and effective permissions. Pass `workspaceId` to each content tool (`get_workspace`, board/design reads, history, validation and `apply_changes`). Account requests without a target are rejected; no process-global active file exists, so concurrent calls cannot redirect each other. HTTP clients use `x-workspace-id`. `get_schema` and `list_workspaces` do not require a file. Temporary guests cannot issue credentials. Removing membership immediately removes that file from account access; other memberships remain accessible.

Existing file credentials are never upgraded automatically. Create an account credential in Settings and run `pnpm mcp:setup` once to replace the old connection. Renewing or revoking is still per credential. Account credentials appear in Agent access in every accessible file.

New installs use `ARIL_AGENT_ORIGIN`, `ARIL_AGENT_TOKEN`, `ARIL_MCP_CONFIG`, `~/.config/aril/mcp.json`, and `aril_agent_` tokens. Legacy `POMEGRANATE_*` MCP variables, saved `~/.config/pomegranate/mcp.json`, and `pome_agent_` tokens still work. Explicit Aril configuration takes precedence; malformed new configuration never silently falls back. Rename your client's server registration to `aril` and install `aril-studio`; restart the connection/new chat to refresh tool names. The skill installer preserves older installed skills and backs up overwritten Aril skills. Remove the old `pomegranate-studio` skill only after checking for personal edits.
