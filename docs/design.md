# Studio design direction

The starting direction pairs an aubergine navigation rail with a light, dotted working canvas and restrained berry accents. The name appears through an original seed mark and botanical language. Most of the space belongs to the user's diagrams rather than decorative dashboard cards.

Manrope provides compact, distinctive headings; DM Sans handles controls and longer copy. Muted borders separate regions, and colors distinguish node kinds without serving as their only label. Diagram handles, focused selection, and a dedicated inspector make the canvas editable rather than a static illustration.

The design-board page is a study for the future deployment interface. It has explicit sample-data labeling, selectable sample services, activity/access tabs, and saved accent/density/direction choices. It does not send commands to containers. The chosen accent affects the sample interface; it does not retheme every studio control.

Juxtopposed is a user-supplied influence, interpreted through the installed unofficial project skill. This work uses original layouts and assets. See `docs/skills.md` for the researched sources and limitations; no claim is made to have installed her own skill or reproduced a specific video design.

Responsive behavior collapses navigation into a drawer, keeps the graph pannable, and presents node details over the canvas when space is limited. Narrow views reduce secondary toolbar text. Input labels, focus states, dialog focus trapping, text status indicators, and reduced motion are included. Automated and manual checks are scoped in `docs/verification.md`; a full accessibility audit remains future work.

## Board wireframes

The board switcher remains above two local sections: Blueprint and Wireframes. The working arrangement is a canvas beside a contextual inspector, with the block palette in the Add block menu and empty-state inspector. Screens are white browser-like frames whose title bars move their contained blocks. Connection arrows represent interactions and retain editable labels; preview mode hides editing handles and follows those same connections.

This extends the existing palette: canvas `#f6f5f9`, surface `#ffffff`, text `#423a4c`, muted outlines `#bdb5c4`, soft fill `#f2eef5`, interaction accent `#a34d6c`. Manrope remains the heading face and DM Sans the controls/content face. Quiet wireframe blocks give the planned interface visual priority; selection colors and participant badges communicate collaboration. Flow navigation eases the camera only after a user action and respects reduced motion.
