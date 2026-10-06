# Agents and the planning studio

Pomegranate includes a local **MCP server** for live workspace access and a **companion skill** for planning and layout conventions. It works with the hosted studio and self-hosted installs. It reads and edits saved planning data; it does not execute infrastructure deployments.

## Connect Codex

Requires Node 24+ and this checkout with `pnpm install` completed.

1. Open the workspace. Choose **Workspace actions (…) → Agent access**, or **More → Agent access** on mobile.
2. Create a named credential with **Read only** or **Read and edit**, expiring in 7, 30, or 90 days. It grants access only to this workspace under your membership. The secret is displayed once; copy it locally, not into a chat.
3. In the checkout run `pnpm mcp:setup`. Enter the studio origin (e.g. `https://pomegrenate.vercel.app`) and paste the credential at the hidden prompt. This verifies access and saves it outside the repository at `~/.config/pomegranate/mcp.json`. On Windows, setup restricts the credential file ACL to the current user; on Unix, the directory/file modes are 0700/0600.
4. Run the `codex mcp add pomegranate -- ...` command printed by setup. It contains only the Node executable and absolute server script path, never the credential.
5. Run `pnpm skill:install`. This installs the versioned skill from `integrations/pomegranate-studio/SKILL.md` to `$CODEX_HOME/skills/pomegranate-studio` (or `~/.codex/skills`). It refuses to overwrite a different existing skill.
6. Open a new chat. Ask: “Use Pomegranate to read the deployment board and add a wireframe for recipe creation.” The chat should first read the connected workspace.

Keep this checkout available: the registered server runs `mcp/index.ts` directly with Node. Update dependencies with `pnpm install` after pulling new versions. `pnpm mcp` is available for debugging, but MCP clients should launch Node directly to keep stdout free of package-manager output.

For another stdio MCP client, use its server configuration format with command = the absolute Node executable, args = the absolute path to `mcp/index.ts`. The server reads the same saved configuration. For multiple connections, use a different MCP server name and set `POMEGRANATE_MCP_CONFIG` to a separate absolute credential-file path per server. If you use that variable during setup, also set it in the registered client's environment. Alternatively supply `POMEGRANATE_AGENT_ORIGIN` and `POMEGRANATE_AGENT_TOKEN` through the client's private environment/secret mechanism. The token is never a command-line argument.

This is **local stdio MCP**, with an HTTPS API bridge to Vercel; it is not a public remote MCP endpoint. Cloud-only clients that require a remote OAuth MCP URL need a separate transport/auth integration. No public `/mcp` endpoint is exposed by this implementation.

## What agents can do

| Tool            | Purpose                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `get_workspace` | Workspace identity, revision, board overview, requirements, notes, design direction; optional full graphs |
| `get_board`     | Complete blueprint and wireframe plus browser link                                                        |
| `get_schema`    | Current graph/document field types and limits                                                             |
| `get_history`   | Recent saved revisions and attributed activity                                                            |
| `apply_changes` | Atomic targeted edits to boards, nodes, connections, wireframes, requirements, notes, and design          |

Writes use the existing operation model: ID-addressed paths, exact `before` values, a required `baseRevision`, and an idempotency UUID `requestId`. Read responses use arrays; operation paths and whole-board values use ID-keyed collections. See the companion skill for examples. The whole document is validated before saving: dangling edges, unknown requirement links, and invalid wireframe parents are rejected. Up to 500 operations fit in one transaction. Request bodies are capped at 5 MB.

An agent edit increments the normal document revision, retains snapshots, appears in team activity as **connection name (agent · member name)**, and reaches connected browsers through the existing workspace stream. It does not write cursor/presence records or impersonate a human cursor. Lost-response retries with the same requestId do not apply a second time. A stale revision returns 409; agents must read and reassess, not replay blindly.

## Access and storage

Agent credentials are distinct from browser sessions. The database stores only a SHA-256 hash of the random 256-bit secret. Each credential includes an owner, workspace, scope, creation time and expiry. Membership is checked on every agent request. Ordinary account, invitation, workspace-creation, and credential-management endpoints do not accept an agent credential. Members can list/revoke only credentials they created; creating one does not change membership.

Revoke a connection in **Agent access** to reject subsequent requests (an already-authorized request may finish). To rotate/renew, create a new credential, rerun setup, restart/reconnect the client, then revoke the old one. Closing the dialog clears its displayed secret; the browser does not persist it. Credentials created for different workspaces must have separate MCP configurations. Keep the local credential directory out of sharing/backups intended for others.

The new `agent_credentials` table is additive in SQLite and Postgres. No studio document or membership is reset. Credential reads do not update last-used records or create document revisions. No database or Supabase service key is needed by the MCP client.

## Validation

`pnpm test` covers an actual SDK client/stdio server handshake, reads and edits against a temporary SQLite instance, scope/expiry/revocation, account-route isolation, ownership checks, stale writes, idempotency, graph validation, history attribution, and absence of plaintext tokens in the database. The optional `POSTGRES_TEST_URL` suite uses an isolated schema and verifies cross-instance credential access/revocation. Never use production planning documents as test fixtures.
