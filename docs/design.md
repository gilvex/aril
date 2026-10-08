# Studio design direction

The studio pairs a light, dotted working canvas with white floating controls and restrained berry accents. The name appears through an original seed mark and botanical language. Most of the space belongs to the user's diagrams rather than decorative dashboard cards.

Manrope provides compact, distinctive headings; DM Sans handles controls and longer copy. Muted borders separate regions, and colors distinguish node kinds without serving as their only label. Diagram handles, focused selection, and a dedicated inspector make the canvas editable rather than a static illustration.

The Design page is a freeform interface editor. Its optional dashboard template illustrates the future deployment interface using editable layers; it does not send commands to containers. Saved defaults affect new elements/templates, while each layer has its own appearance.

Juxtopposed is a user-supplied influence, interpreted through the installed unofficial project skill. This work uses original layouts and assets. See `docs/skills.md` for the researched sources and limitations; no claim is made to have installed her own skill or reproduced a specific video design.

Responsive behavior uses bottom navigation and a canvas action bar on phones and tablets (up to 1024px, or 1366px with a coarse primary pointer). The More sheet contains the workspace switcher, Team activity, Undo/Redo, history, import, and export. Desktop uses direct Canvas, Requirements, Design, and Notes shortcuts in the single app bar. Input labels, focus states, dialog focus trapping, text status indicators, and reduced motion are included. Automated and manual checks are scoped in `docs/verification.md`; a full accessibility audit remains future work.

The touch layout keeps the existing canvas `#f6f5f9`, surface `#ffffff`, text `#423a4c`, muted `#796f82`, berry `#b34568`, and aubergine `#302b3b`, with Manrope headings and DM Sans controls. Compact, left-aligned headers sit above the work; action labels and navigation are centered beneath it. The layout is `app bar / canvas with floating board navigation / canvas tools / main navigation`, with safe-area padding around the bottom controls. Tool palettes open upward; inspectors and requirement details become scrollable sheets. Inspectors start closed and open through Details or double-clicking an item. Select mode lets users tap multiple nodes or blocks, then tap Done to drag the group. Pan/zoom remain available, while initial compact canvases fit their contents. Larger controls and 16px form inputs support touch use without changing the desktop density.

## Board wireframes

The floating board switcher sits beside two local sections: Blueprint and Wireframes. The working arrangement is a canvas beside a contextual inspector, with the block palette in the Add block menu and empty-state inspector. Screens are white browser-like frames whose title bars move their contained blocks. Connection arrows represent interactions and retain editable labels; preview mode hides editing handles and follows those same connections.

This extends the existing palette: canvas `#f6f5f9`, surface `#ffffff`, text `#423a4c`, muted outlines `#bdb5c4`, soft fill `#f2eef5`, interaction accent `#a34d6c`. Manrope remains the heading face and DM Sans the controls/content face. Quiet wireframe blocks give the planned interface visual priority; selection colors and participant badges communicate collaboration. Flow navigation eases the camera only after a user action and respects reduced motion.

## Canvas-first navigation (variant B)

One 56px app bar keeps workspace switching, save status, collaboration, and profile controls together. The overflow menu contains history, import, and export, plus Undo/Redo on compact screens. A floating board picker replaces the board tabs and title row, with board creation, renaming, and deletion inside it. Blueprint/Wireframes remain beside the picker, with participant avatars and counts.

Desktop uses a bottom-center Select/Pan/Connect/Add dock and top-right Details/fullscreen controls. Select supports dragging nodes and marquee selection; Pan moves the viewport; Connect leaves handles available while preventing accidental node movement. Wireframes adds Preview flow. Phones and tablets move Details/fullscreen into the dock above the main bottom navigation. Inspectors retain resizing on desktop and become sheets above the dock on touch layouts. The desktop sidebar is replaced by direct page shortcuts in the app bar. Existing preferences, routes, document data, and collaboration are preserved.

## Direct page navigation

Canvas, Requirements, Design, and Notes are one-click buttons beside the workspace name. Active-page styling and compact participant indicators preserve orientation and live presence. The single overflow menu beside Notes contains Team activity, revision history, import, and export. People, profile, save status, and Undo/Redo remain on the right. At narrower desktop widths, profile/save text condenses while all four page buttons remain visible. Mobile retains the bottom navigation and uses a white More sheet for secondary actions. Board switching and Blueprint/Wireframes stay in the floating board picker.

## Appearance

Light, Dark and System are personal appearance options in the desktop workspace actions menu, mobile More sheet and workspace chooser. The setting is stored in this browser, synchronized across its tabs, and applied before React loads. System follows operating-system changes. Appearance never changes the shared document or design-study accent.

Dark mode keeps berry actions and Manrope/DM Sans typography. Its palette uses aubergine canvas `#19161f`, surface `#25212d`, raised fill `#393141`, strong text `#f1ebf5`, muted text `#aaa0b6`, borders `#443b50`, and accent text `#f0a1be`. Semantic tokens cover forms, floating canvas controls, wireframe blocks, requirement rows, collaboration panels and dialogs. Node kinds retain distinct green, blue, pink and purple accents; collaborator colors remain unchanged.

## Requirements list and board views

Requirements use one compact toolbar and shared search/area/status/priority filters. The List view has independent checkboxes for bulk changes; clicking the requirement opens a wide, resizable document editor. Shift-click selects a visible range, and select-all applies to the current results. Bulk actions update status, priority or area in one undoable document change.

Board view groups the same requirements by status or priority. Drag a card between lanes or use its Move to control with a keyboard or touch screen; only the grouping field changes. Lane add buttons create an item in that group. Empty lanes remain available as drop targets. Selecting a card opens the same editor, with field-level collaborator presence and links to blueprint nodes.

View, grouping and editor width are local preferences scoped to profile and workspace. Filters and selection are temporary and never broadcast as document changes. On phones, the detail editor fills the workspace with a Back to requirements button. The page uses the existing light/dark tokens and English/Russian catalogs.

## Design workbench and notebook (October 2026)

Workspace navigation lives in a collapsible left sidebar on desktop, with open workspace tabs across the top. Tabs remember their last section/board and survive refresh within the browser session. Opening another workspace waits for the current document to save; closing a tab does not delete its workspace. The workspace library remains accessible from Home or +. Mobile retains bottom navigation. The informational footer has been removed.

Design has context menus on the canvas, page rows and layer rows. Page names are edited inline only when requested; the last page cannot be deleted. Layer menus expose zoom to selection, properties, duplicate, ordering, hide/lock and delete. Canvas menus also insert elements at the clicked location. Ellipsis buttons expose the same actions to touch and keyboard users. Pages uses a searchable floating picker with inline rename and page actions. Layers has its own always-visible toggle; both start closed, and opening either tool leaves the canvas navigation in place. The inspector uses compact position/size fields, working alignment controls, and separate appearance, fill and stroke sections; extra layer actions live in its menu. Alignment uses the selection bounds or the parent frame for a single child, without double-moving selected frame children. These controls use existing design operations and do not change the MCP document schema.

Design opens onto a pan/zoom canvas with floating navigation and an Insert dock. A floating Layers panel owns frame/layer trees; the right inspector owns position, size, fill, border, typography and layer order. Both overlay the canvas instead of shifting its navigation. The same tools serve standalone Design and board-specific Design sections. Frames contain layers and carry them when moved or duplicated. Text and button labels can be edited directly on double-click. Templates are inserted only on request and become ordinary layers. Mobile panels start closed and open as overlay sheets. The existing palette and typography remain unchanged for studio controls; designed frames retain their own colors in both studio themes.

Design pages and layers are indexed by ID for independent collaborative edits and participate in existing conflict protection, import/export, history and undo. Cursors, selection, transient drag positions and viewport following are scoped to the active design page. Drag frames use the live presence transport and commit one final document edit. Page choice stays in tab storage; pan/zoom and selection remain private UI state. Existing accent, fonts, density and direction notes are preserved as defaults. A workspace with no design pages starts blank without modifying its saved document. The first release supports up to 30 pages and 500 layers per page, a single frame-parent level, and HTTPS image references.

Notes now provides a searchable document list, Markdown editor, Edit/Split/Read modes, and a collapsible heading outline. On phones the list opens as a drawer and Split stacks editing above reading. Formatting preserves the text selection; links to boards and requirements open in a new tab so unfinished edits remain in place. Raw HTML is not rendered. Existing project notes are preserved as the first document and cannot be deleted from the UI; additional notes can be renamed, deleted, and recovered with Undo. No sample documents are inserted into existing workspaces.

Both layouts use the studio's berry accent, existing variable fonts, semantic light/dark colors, and compact toolbars. Their working surfaces replace the former marketing headings and static explanation cards.

## Sign-in entry screen

The entry screen puts returning users' Google sign-in first, with a native, keyboard-accessible invitation disclosure below it. Incoming invitation links expand that form; signed-in invitees keep the existing accept-as-profile flow. Google access still requires a previously linked studio account. Desktop pairs the form with a static, decorative runtime → game layer → server blueprint example; phones hide that example and keep a single scrollable column. Appearance, language and app installation remain available before signing in.

The official Google Identity Services button uses the container's measured width (up to Google's 400px limit), observes responsive changes, ignores unchanged/hidden sizes and disconnects its observer on unmount. No custom imitation button, login popup or new authentication mechanism is introduced.

## Workspace library

The signed-in home uses a compact brand/account header and one toolbar with search, last-opened/name sorting and workspace creation. Desktop cards show miniature previews of the first blueprint, membership roles and member profile pictures (initials when unset). Phones use horizontal cards and a sticky New workspace action. Appearance, language, account switching and logout live in the account menu. Creation opens an accessible native dialog; existing workspaces are never seeded or changed by previews.

Last-opened times are personal, stored per profile on this device after a successful workspace load. The membership-scoped overview endpoint returns only the first 16 blueprint nodes, 32 connections and three member identities per workspace, including their saved avatars; it omits full documents and account details. Empty blueprints show a blank-board placeholder. Previews are navigation aids, not a full rendering of wireframes or every board.

## Aril identity

The approved Aril identity replaces the product-facing Pomegranate name. The logo is a single asymmetric seed with an offset negative-space cutout, reconstructed as a small, scalable SVG from the approved concept. Berry (#b34568) and a lowercase Manrope wordmark retain the existing visual palette. The header, login, initial loader, design preview, favicon, offline screen, Apple icon and PWA manifest use the new identity. App icons reverse the seed to warm white on berry and keep it within the maskable safe zone.

The manifest retains its root identity and the service-worker cache version advances without forcing editors to reload. Stable protocol, session, package and database identifiers keep their existing names; saved workspace titles and authored planning content are not rewritten. Newly initialized installations use Aril starter content.

## Compact board overview

Blueprint Overview contains editable board name and description, node/connection/decision counts, open questions and deduplicated linked requirements. Questions focus their node and open its details; requirements open the existing requirement editor. Add node and Board actions keep insertion and renaming close by. Viewer access remains read-only. The Details toggle is hidden while the inspector is open, with its close control inside the panel.

## Design tools on touch screens

Desktop groups the Layers toggle beside Pages. Compact screens keep one fixed, icon-only app navigation across Canvas, Design, Brief, Notes and More, including board-specific Design. Accessible names remain on every icon. The 60px navigation plus safe-area inset reserves the same space on every page.

Design uses a separate floating Select / Pan / Insert / Pages / Tools toolbar. Pages opens directly into page search and selection; Tools remembers the last Layers, Library or Properties panel; opening Pages never replaces that remembered tool. Both use one nonmodal Vagabond bottom drawer above the navigation. Pages, Layers, Library and Properties use a single-selection Vagabond button group at the bottom of that drawer. Its neutral raised selection, subtle border and consistent 44px touch targets match the charcoal editor; keyboard focus remains visible. Styles lives under Properties. Selecting layers keeps the drawer open; Redux remembers the last tab. The drawer overlays the canvas without changing its viewport, and its drag handle or close button dismisses it. Interacting with the canvas keeps it open; app/workspace navigation dismisses it. Asset breadcrumbs remain at the top, including a route back from components, variables and state machines. Ordinary page selection no longer occupies the upper-left corner on mobile.

The fixed app navigation stays above nonmodal editor sheets during gestures and transitions. More opens a bounded, scrollable bottom sheet with workspace actions and preferences; it does not repeat the destinations already in the bottom navigation. Full modal dialogs keep their focus trapping.

## Movable dialogs and mobile drawers

Desktop dialogs, collaboration windows and Design panels can be dragged from their header or grip. Arrow keys move a focused grip (Shift takes larger steps); Home resets its position. Movement stays inside the viewport or canvas bounds, and resize or reopening resets the offset. Offsets are transient UI state and never saved to workspace documents. Compact screens use bottom drawers with bounded scrolling, safe-area padding and reduced-motion support. Design tools use a nonmodal drawer so the canvas and global navigation remain interactive. Pages shares the Design tools drawer. Other dialogs retain modal focus trapping.


## Scope direction

Requirements are presented as a board-linked product scope, not a second task board. Use one toolbar, flat board groups, a resizable reading panel and a mobile drawer. Charcoal surfaces and the existing rose selection accent retain the editor identity. Purpose, acceptance and unresolved questions lead; delivery metadata stays under More properties. Agreement is an independent choice and never inferred from existing saved status. Preserve internal requirements IDs and route compatibility.


## Global scroll indicators

All scrollable surfaces use a transparent native track with a slim, rounded neutral thumb. Scrolling reveals the indicator for one second after the last scroll event; mouse hover and keyboard focus also reveal it. Both axes share the treatment, including portaled menus, drawers, text areas and nested Layers trees. Track dimensions remain constant to avoid layout shifts. Touch momentum, keyboard scrolling and thumb dragging stay browser-native; forced-colors mode keeps system scroll controls visible. The passive document listener manages only temporary DOM feedback and cleans up on unmount.
