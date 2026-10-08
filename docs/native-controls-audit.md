# Native control audit — October 2026

The studio uses Vagabond UI 0.4.0. Prefer its interactive primitives when they provide keyboard handling, dismissal or consistent menus; keep semantic DOM elements where they implement editor content or special pointer interactions.

## Migrated in this pass

- All remaining native selects in appearance/language settings, workspace sorting, board inspectors and multi-selection, Notes link insertion, design fonts and agent credential duration now use the existing Vagabond-backed `StudioSelect`. The adapter preserves numeric/implicit option values, empty choices, grouped labels, disabled choices and the existing change contract. Associated sizing and mobile typography selectors target the new trigger.
- Shared action menus use Vagabond root, trigger and item primitives. The Radix portal/content stays as the fullscreen-container adapter.
- Design Insert uses that shared action menu, replacing its native details/summary popover with keyboard selection and outside/Escape dismissal.
- Mobile workspace actions and property mode buttons use Vagabond Button. Page search uses Input. The four mobile design tool tabs use Tabs, with their list at the drawer bottom.
- Mobile More uses the existing Vagabond Drawer adapter rather than Fridge.

## Retained deliberately

- Editable canvas text, numerical inspector fields, Notes text areas, file inputs and color inputs retain their native editing semantics and existing collaborative selection/event contracts. A blanket replacement would need verification of caret, focus, pointer capture and broadcast behavior.
- Layer-tree buttons, canvas interaction handles and diagram controls retain their specialized pointer/keyboard behavior. Native buttons remain valid accessible controls; using a library wrapper alone would not fix an interaction problem.
- Native details/summary disclosures remain for document/property sections, including synchronized expansion. They are not popup menus.
- Existing true modal dialogs and their focus handling remain separate from nonmodal editing drawers.

## Further candidates

Workspace search/actions, modal form buttons, and simple settings text fields can be migrated to Button/Input as those surfaces are revised. Keep their accessibility labels, input types, form submission and multiplayer field identifiers. Avoid replacing controls only to change their tag or import.

Validation includes TypeScript/build, architecture/lint, mobile drawer state tests and select option mapping tests. No database migration or saved workspace changes are involved.
