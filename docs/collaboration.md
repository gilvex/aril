# Shared planning studio

The first visitor on loopback receives an initial profile only when the database has no profiles. Change its name and picture from the top-right profile button. Pictures are cropped to a 192-pixel square locally; accepted uploads are PNG, JPEG, or WebP up to 5 MB. The server stores the resized image in the configured database.

Open People and choose Create invite link. Each link grants edit-and-invite access to the current workspace, works once, and expires after 24 hours. Recipients first sign in with Google, then redeem the invitation into that linked profile. Signing in alone grants no workspace access. Existing guest profiles must connect Google before redeeming another invitation. No email is sent. Every member has edit/invite permissions within that workspace; member removal and a device/session management dashboard are not implemented. Current-browser logout and account switching are available from the profile panel. The home screen lists accessible workspaces and lets members create new ones. See [Google account linking and deployment](accounts-and-deployment.md).

Names, pictures, cursors, selected nodes, and saved changes appear live. The activity panel shows who edited nodes, boards, connections, requirements, notes, and design direction. Pan and zoom are shared only as transient presence; they never enter document history. Open People and click a member to follow that specific browser session. Following mirrors their board/section, canvas center and zoom, while their live cursor and selection remain attributed to them. Different screen sizes retain the same canvas center. Click, pan, use the keyboard, press Escape, or choose Stop following to regain control. Opening `/` cursor chat and typing or dismissing its composer keeps follow active. Follow ends when that session leaves or starts following someone else, preventing follow loops. Requirements navigation follows the selected requirement; other pages follow the active section, without mirroring page scrolling or private form contents. Following is never persisted across refreshes. Unrelated edits merge automatically. If two people change the same field or delete an item another person is editing, the affected browser preserves its draft and offers export/reload recovery. Undo affects local edits and refuses to overwrite conflicting collaborator work.

The current workspace, board, section, and selected requirement are recorded in the page URL. Refreshing or opening a bookmarked link restores that location after checking workspace membership. Switching to the workspace list clears the route. Unavailable workspaces return to the list; missing boards fall back to the first existing board. Navigation stays local to each tab and never writes shared planning data. Canonical URLs use `/w/:workspaceId/:view` and `/w/:workspaceId/canvas/:boardId`; optional wireframe mode and requirement selection remain query parameters. Legacy query-only links are accepted. Vercel and the standalone server serve the app for these paths.

Opened workspace editors remain mounted in an account-scoped, in-memory cache while switching tabs or visiting the workspace list. Their selection, inspector, camera and undo stack survive. Inactive editors pause presence and event streams and do not handle global editor shortcuts. Returning resumes the streams and fetches an authoritative snapshot in the background; revision-checked merging still protects local edits. Already-mounted editors do not replay recovery drafts. Closing a workspace tab releases its cache entry after saving, and logout/account changes clear all cached editors. A full browser reload restores tabs and routes, but recreates editor memory.

Node and group positions are broadcast during dragging, coalesced at 50 ms over hosted WebSocket sessions (90 ms for the self-hosted SQLite event stream). Receiving canvases ease between these previews, keeping connections and the minimap aligned. Local dragging remains immediate. Preview frames do not create saved revisions or undo entries; normal autosave commits the document and clears the preview. Failed saves clear the shared preview, and disconnecting removes it. Reduced-motion preferences disable the interpolation.

Selected connections use the selecting member's color, with a stronger stroke and soft outline visible to collaborators. Nodes and connections show grouped name-and-avatar badges for everyone selecting them, including yourself marked “you.” Selecting an already-selected item retains the other members' badges, and deselecting removes only your own. Badges wrap instead of overlapping and deduplicate multiple sessions of the same member. If several members select the same connection, your own selection takes line-color priority while each badge retains its member's color. Page navigation and board tabs show up to three member avatars, with an overflow count and names on hover. A person with multiple tabs appears once per location. Presence follows navigation and disappears on disconnect.

Requirements also show each member's selected row in the list and detail panel. Badges distinguish viewing, editing a named field, and typing. Text typing indicators return to editing after 1.5 seconds of inactivity; blur returns to viewing. The relevant field is outlined in a collaborator's color and names its editors. Closing, deleting, or leaving the requirement clears that presence. These indicators do not lock fields; existing conflict protection still applies to simultaneous edits of the same field.

## Hosting for another device

The default localhost link only works on the same machine. Build the application and serve it behind an HTTPS reverse proxy that supports streaming responses without buffering. Configure the actual shared origin. For example, in PowerShell, replacing the example domain with your own:

```powershell
pnpm build
$env:POMEGRANATE_ORIGIN = 'https://studio.example.com'
$env:HOST = '127.0.0.1'
pnpm start
```

Proxy the shared domain to `http://127.0.0.1:4317`, preserve its Host header, and allow event streams to stay open. If the proxy runs on another machine/container, set HOST to the required bind address and restrict network access accordingly. Remote binding requires POMEGRANATE_ORIGIN. Generate and open an invitation at the shared origin, then create subsequent invitations from that same origin. The development Vite server remains local.

For the first remote invitation, or if browser data was cleared/session expired, run from the repository root:

```powershell
pnpm invite
```

This loads `.env` and uses the configured storage backend. It uses POMEGRANATE_ORIGIN, then POMEGRANATE_CLOUD_ORIGIN, then the local development URL. Set POMEGRANATE_WORKSPACE_ID to target a workspace other than `default`. For a local production server, set PORT=4317 before generating the link. SQLite must use the same POMEGRANATE_DATA_DIR as the running server. The command prints a one-time invitation; share it only with the intended collaborator. It does not expose the service to the network.

## Session and storage behavior

Workspace writes require the current editor protocol (`x-pomegranate-write-version: 2`). PATCH requests also carry `baseRevision`; the server rejects stale revisions before applying operations and retains atomic compare-and-swap protection during concurrent saves. Old bundles receive HTTP 428 with a reload instruction. Current clients can rebase unrelated, non-deleting edits after a revision race; conflicting edits and stale removals stop with export/reload recovery.

On opening a workspace, a recovery draft is automatically resumed only when its protocol, base revision, and base document match the latest saved workspace. Older drafts are held behind an out-of-date notice with a download option. Continuing fetches the saved workspace again and never replays that older draft. Incoming live updates also stop pending removals from being silently rebased.

Sessions last 30 days. The server stores hashed opaque tokens, with an HttpOnly SameSite cookie plus a browser-local token fallback for embedded browsers that do not retain cookies. The fallback is sent in Authorization headers, never query strings. Members who connect Google can sign back into their existing profile after expiration or clearing site storage. Unlinked guest profiles still require a new invitation; their display names are not verified accounts.

SQLite additions preserve existing workspace data. Back up the complete data directory while the server is stopped. Live presence is transient; saved documents, profiles, and activity survive restart. Pending edits use per-tab sessionStorage and survive reload, but not closing that tab. Export a pending or conflicting draft before closing it. Existing older drafts are explicitly offered for download before continuing with the saved workspace.

SQLite supports one process and up to 64 live connections. Vercel uses Postgres for saved documents and private Supabase WebSocket channels for transient presence, so collaborators can connect to different function instances without writing cursor rows. See accounts-and-deployment.md for authorization, reconnects, and setup. This is a trusted-team planning studio; deployment permissions, enterprise tenants, SSO and revocation remain separate work.

### Notebook collaboration

Additional notes merge by document ID and field. The original note remains in `notes`; its optional title is `notesTitle`. Additional entries use `documents: [{ id, title, body }]`, with at most 50 entries and 50,000 characters per body. Older documents need no database migration. Editing different documents merges. Notes edited in the current studio also merge concurrent character insertions and deletions with Yjs. Titles and legacy whole-body replacements retain field conflict protection.

Transient note presence uses the existing selected-ID channel (`note:<id>` and `note-field:title` / `note-field:body`). It shows who is viewing or editing the selected document without writing database presence records. Following a participant also selects their note, but does not mirror scrolling or text cursors. The last selected note is a browser preference scoped to the profile and workspace. It is not part of shared undo/history.

For account-free temporary collaboration, use **People → Temporary guest links**. Choose a duration and share the guest link. Revoking it ends all access granted by that link, including sessions already in use. See [temporary guest access](accounts-and-deployment.md#temporary-guests).

## File permissions and settings

Settings is available from the sidebar (or mobile workspace menu) at `/w/:workspace/settings`. File settings list members with avatars, allow owners to assign Editor (`member`) or Viewer (`viewer`) roles, and remove non-owner members after confirmation. Existing memberships remain unchanged; new permanent invites still join as Editors. Temporary guests keep their expiry/revocation rules and can be removed individually. Only owners create permanent invitations and manage guest links. User settings edit profile and account access; App settings hold device-local appearance and language.

Membership and role are checked on every document write, including MCP requests and the commit transaction. Changing a role affects existing credentials. Removal also revokes agent credentials and unused invites created by that member. Local event streams disconnect immediately; cloud streams revalidate membership on their existing heartbeat. Signed realtime certificates expire within 30 seconds and refresh every 15 seconds; Viewer certificates cannot publish edit previews. Active editors refresh their access role every 15 seconds and on reopening a cached workspace. Already received content cannot be recalled from a browser. Pending drafts remain recoverable instead of being discarded on a permission failure.

## Notes cursors, selections, and comments

Notes publishes bounded document-scoped presence through the existing live transport. `note` includes the document ID, Edit/Read surface, a source-body fingerprint, a selected text range and optional quote, and a pointer position relative to the text surface. Local scrolling and resizing recompute remote highlight geometry. Different rendering modes match only an unambiguous exact quote; mismatched body fingerprints and stale sessions are hidden. Switching notes/pages, leaving the editor, or disconnecting clears presence. Cursor/selection traffic never writes document revisions or Postgres rows.

The Comments panel saves `noteComments` by ID through normal revision-checked operations. Comments can quote selected text, be resolved/reopened, and be deleted by their author through the UI. Quotes remain snapshots even when the source text changes. Independent comment additions merge without replacing another person's comment. Editors can post; existing Viewer permissions remain read-only. Deleting a note removes its comments in the same save. Existing workspaces require no migration or seed reset.

The existing temporary cursor-chat button and `/` shortcut also work in Notes (the shortcut does not intercept typing inside text inputs). Peers in the same note see these six-second messages beside the collaborator's name. They are distinct from saved Comments. On compact layouts, saved comments use the shared Vagabond drawer.


## Live note text

The Notes editor broadcasts incremental Yjs text updates on the existing private WebSocket channel, separately from cursor presence. Peers apply them immediately; no per-keystroke database writes are added. Background workspace saves still persist plain Markdown and optional `noteStates` metadata together through revision-checked operations. The self-hosted single-process fallback uses authenticated POST/SSE messages in memory. Viewers may request and receive text state but cannot publish changes or snapshots. Hosted broadcasts carry an Ed25519 signature, a current workspace membership certificate with edit permission, and a bounded timestamp.

Updates are idempotent and order-independent. Periodic state-vector exchange repairs missing messages and reconnect gaps. Notes keep the caret anchored across remote changes and buffer IME composition locally until it finishes. Undo records only the local edit, not remote text already received over the live channel. A newly created note saves its CRDT state in its first batch. Deleting a note drops its internal state; legacy whole-body replacements start a new baseline and competing old-baseline saves use the existing conflict/recovery flow.

`noteStates` is managed metadata, not a second editable body. Its entries contain the original seed text and base64url Yjs updates. `noteText/<noteId>` operations atomically merge this state and update the readable body. Tools that edit plain `notes` or `documents/<id>/body` remain compatible; they must still read the current revision and compare the prior body. Stored comments and quotes remain separate from temporary chat and live selection highlights.

Boards, Design and Notes use the same arrow, avatar and colored cursor label. Temporary chat extends that label as `Name: message`, with no duration helper block. It expires through presence and never enters workspace history.


## Live shared fields and control presence

Scope's “More properties” accordion shares its open/closed state with participants viewing the same requirement, including followers and viewers. Disclosure updates travel in requirement presence and stay in session Redux state; they create no document edits, database writes, saved preferences or undo entries. Versioned toggle IDs make repeated heartbeats idempotent and simultaneous toggles converge. Other requirements, other pages and stale sessions cannot change the visible accordion. Native summary keyboard activation uses the same controlled toggle as mouse/touch; applying a remote state does not generate another toggle.

Shared workspace field changes are previewed over the existing signed realtime channel before the background save completes. This includes Scope text/properties/questions, board and wireframe details, design properties and names, note titles and existing saved comment fields. Numeric or validated URL controls publish when their editor accepts a valid change. New entities, deletions and Notes body CRDT messages retain their existing paths. Transient previews are not inserted into another user's save batch, recovery draft or undo history. Same-field competing edits still use explicit conflict recovery; character-level merging currently applies to Notes bodies only.

Each field packet identifies its authenticated tab, has an increasing sequence, and contains at most 300 operations / 200,000 serialized characters. Pending values are coalesced at 100 ms and retransmitted every two seconds to repair missed packets. Viewers cannot publish changes. A saved value supersedes its matching preview; stale/deleted targets and incompatible local edits reject previews. Disconnected previews expire within six seconds (plus the two-second cleanup interval). Field packets add no database writes.

Shared editing surfaces advertise stable entity scopes. Focus outlines, names and text-selection geometry use those scopes and control anchors; pointer positions follow the current control when panels scroll or resize. The same peer cursor is used in the surrounding UI, including Scope. Presence carries selection offsets and a text fingerprint, never the raw field value or selected quote. Existing Notes/canvas cursor renderers continue to own their surfaces. Settings, account/access forms, secrets, file inputs and temporary-message composers are excluded from field presence. Device-local filters/navigation remain local. Private controls should use `data-collaboration-private`; new shared editors should declare `data-collaboration-scope` and stable input names.
