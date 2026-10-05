# Shared planning studio

The first visitor on loopback receives an initial profile only when the database has no profiles. Change its name and picture from the top-right profile button. Pictures are cropped to a 192-pixel square locally; accepted uploads are PNG, JPEG, or WebP up to 5 MB. The server stores the resized image in the configured database.

Open People and choose Create invite link. Each link grants edit-and-invite access to the current workspace, works once, and expires after 24 hours. A new recipient enters a display name; a signed-in recipient keeps their profile and gains membership. No email is sent. Every member has edit/invite permissions within that workspace; member removal and session management are not implemented. The home screen lists accessible workspaces and lets members create new ones. See [Google account linking and deployment](accounts-and-deployment.md).

Names, pictures, cursors, selected nodes, and saved changes appear live. The activity panel shows who edited nodes, boards, connections, requirements, notes, and design direction. Pan and zoom are private. Unrelated edits merge automatically. If two people change the same field or delete an item another person is editing, the affected browser preserves its draft and offers export/reload recovery. Undo affects local edits and refuses to overwrite conflicting collaborator work.

The current workspace, board, section, and selected requirement are recorded in the page URL. Refreshing or opening a bookmarked link restores that location after checking workspace membership. Switching to the workspace list clears the route. Unavailable workspaces return to the list; missing boards fall back to the first existing board. Navigation stays local to each tab and never writes shared planning data.

Node and group positions are broadcast during dragging, at most about every 90 ms. Receiving canvases ease between these previews, keeping connections and the minimap aligned. Local dragging remains immediate. Preview frames do not create saved revisions or undo entries; normal autosave commits the document and clears the preview. Failed saves clear the shared preview, and disconnecting removes it. Reduced-motion preferences disable the interpolation.

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

SQLite supports one process and up to 64 live connections. Vercel uses shared Postgres storage and presence, so collaborators can connect to different function instances. See accounts-and-deployment.md for stream lifetimes and polling limits. This is a trusted-team planning studio; deployment permissions, enterprise tenants, SSO and revocation remain separate work.
