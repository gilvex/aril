# Studio guide

[Open Aril](https://www.aril.studio) · [Account-free demo](https://www.aril.studio/?demo=1) · [Illustrated changelog](https://www.aril.studio/changelog)

## Demo and workspace navigation

The demo uses editable sample boards, requirements, designs, and notes. Named teammates and service states are simulated. Edits/history stay in this tab's session storage; Reset demo restores the fixtures. Invitations and account/agent management require a real workspace.

Opened workspace tabs retain editors, selection, camera, and undo history in memory. Inactive tabs pause collaboration; returning refreshes authoritative data. Closing a tab releases its editor after saving. Logout/account switching clear the editor cache. Canonical `/w/:workspaceId/...` links restore location after access checks.

## Canvas

Select nodes to edit them. Drag between handles to connect nodes. Ctrl/Cmd-click adds to selection; Shift-drag selects an area. Dragging selected nodes moves the group; group operations share an undo step. Delete removes selected nodes and attached connections.

Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z redoes. Ctrl/Cmd+S saves when focus is outside a text field. Fullscreen keeps the current graph, selection, and camera; Escape exits. Browsers without native fullscreen use the expanded-viewport fallback.

Blueprint and Design are the active board sections. Wireframes navigation is retired; historical content remains available through stored documents, export, and MCP.

## Design and Library

Design supports editable frames, text, shapes, buttons, HTTPS images, nested groups, and masks. Double-click text to edit. Use the layer context menu or ellipsis controls for group/frame/mask actions. Ctrl/Cmd+G groups; Ctrl/Cmd+Shift+G ungroups. Ungrouping preserves canvas positions.

Layers and Properties can float, dock to any canvas edge, or form tabbed groups. Drag the panel grip or use its layout menu. Resize handles accept arrow keys and double-click reset; a focused grip accepts arrow keys and Home. Layout is browser-local. Mobile uses one drawer at a time.

Library groups components, variables, and pages into libraries/families. Search, filter, and follow dependency or usage links back to Design. The source picker separates workspace assets from board assets. Expand graph groups in place; each expansion starts with 12 assets and offers Show more. Selection dims unrelated items without rearranging the graph.

Component icons use a geometry-derived outline by default; an emoji or symbol overrides it. Variables have a dedicated editor. Historical state-machine records remain available for round-trip export but are outside active editing/usage counts.

## Scope and Notes

Scope organizes requirements by board, workspace-wide outcomes, and unlinked items. Decisions (Proposed/Agreed/Deferred) are separate from delivery status. Details include acceptance criteria, resolvable questions, and links to planning surfaces. Filters and bulk selection preserve hidden selections explicitly.

Notes offers Markdown editing, reading/split views, an outline, and saved quoted comments. Note-body edits merge with Yjs; titles and ordinary fields retain conflict handling. Undo tracks local edits. Comments remain saved records; temporary cursor chat does not enter document history.

## Collaboration and access

Live cursors, selections, field previews, and following are transient. Click a participant to follow their active session; interacting locally or pressing Escape stops following. Press `/` on a canvas for a six-second cursor message; ordinary text inputs keep their typing behavior.

Owners manage invitations, guest links, editor/viewer roles, and non-owner removal in Settings. Viewers cannot save edits. Temporary guest links grant expiring editing access without Google; their revocation ends access granted by that link. See [accounts and hosting](accounts-and-deployment.md) and [collaboration](collaboration.md) for exact access/reconnect behavior.

Scoped agent credentials let external tools read or edit through the same validation and revision checks. Secrets are displayed once. See [agent integration](agent-integration.md).

## Saving and recovery

SQLite installations persist to `data/studio.sqlite` by default; cloud deployments use Postgres. Pending edits have a per-tab recovery draft. Revision races can rebase unrelated non-destructive edits; competing field edits and stale removals stop for export/reload recovery.

Export gives portable document JSON. Import validates the graph before replacement. Personal undo lasts for the page session; saved history retains up to 30 prior revisions. Neither substitutes for an independent database backup, which also covers identity/access records. Export conflicting work before closing its tab.

See [operations](operations.md) for database backup/restore and [verification](verification.md) for checks.

## Appearance and installation

Appearance supports Light, Dark, and System plus English/Russian interface text. Preferences are device-local; user-authored content is preserved. Controls support keyboard focus and reduced motion.

On supported mobile browsers, use Install app/Add to Home Screen. The PWA caches only a public offline reconnect surface; opening and syncing shared workspaces requires a connection.

## Rename and delete a workspace

On the workspace list, owners can choose **Rename** or **Delete** below a workspace card. Deletion requires typing its current name and permanently removes its documents, revision history, activity, memberships, invitations and workspace agent credentials. Guest links are revoked; other workspaces, permanent profiles and account-wide agent grants remain. Export needed data before deleting. Rename changes the workspace label without rewriting planning content. Open editors in this browser are updated or released after the list refreshes.

A connected Google, Yandex or SSO account already preserves access across devices. The profile displays connected identities and offers linking only to permanent profiles without a connected account.

## Network diagrams and clipboard

Canvas → Add node → Block creates a universal node. Choose a device, router, switch, access point, firewall, server, internet or other icon in the inspector. Record addresses, VLANs and equipment details in Description or Notes; description line breaks appear on the card. Existing equipment nodes are normalized to universal blocks with matching icons when opened, imported, restored from history or pasted. Explicit custom icons and all saved details remain intact. Normal saves persist the new representation; no database reset or bulk live migration is needed.

Ctrl/Cmd+C copies selected Canvas nodes and the connections between them. Ctrl/Cmd+V inserts independent copies with new IDs and an offset; undo removes a paste as one change. Text fields keep normal text copy/paste. Viewers can copy, but cannot paste or edit.

Owners can create up to 25 active guest links with separate View only or Can edit permissions. Choose 5 minutes to 30 days or No expiration. Links cover the entire workspace, including all its boards; revoke a link to end every session created through it and remove it from the list.
