# Studio design direction

The studio pairs a light, dotted working canvas with white floating controls and restrained berry accents. The name appears through an original seed mark and botanical language. Most of the space belongs to the user's diagrams rather than decorative dashboard cards.

Manrope provides compact, distinctive headings; DM Sans handles controls and longer copy. Muted borders separate regions, and colors distinguish node kinds without serving as their only label. Diagram handles, focused selection, and a dedicated inspector make the canvas editable rather than a static illustration.

The design-board page is a study for the future deployment interface. It has explicit sample-data labeling, selectable sample services, activity/access tabs, and saved accent/density/direction choices. It does not send commands to containers. The chosen accent affects the sample interface; it does not retheme every studio control.

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
