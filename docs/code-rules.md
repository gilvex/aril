# Code rules

## Why these conventions

The FSD dependency direction and public slice APIs make ownership/import boundaries mechanically checkable. Scoped Redux models and Saga lifecycles keep pending writes, cancellation, and editor cleanup explicit. The save/recovery invariants are correctness requirements, not formatting preferences.

One-function/type-per-file and the 125-line component limit are this project's chosen navigation/review conventions, not universal measures of code quality. They trade smaller review units for more files and indirection. The limits do not prove maintainability or performance. Keep closely scoped closures with their owner, avoid empty segments, and use the documented rendering-handle/private-secret exceptions rather than forcing non-serializable values into Redux.

When a convention creates unnecessary indirection, propose a focused change with a concrete example, effects on imports/lifecycle/review, and the corresponding architecture-check update. Do not bypass checks or silently introduce new exceptions. Claims that the conventions improve onboarding or delivery speed require measurement; none is established here.

## Enforced rules

These project conventions were requested on 2026-10-06. They take precedence over conflicting recommendations in the official Feature-Sliced Design skill.

- Use camelCase file and folder names. React component files and components use PascalCase. Runtime entrypoints, CLI commands, package names, URLs, and tool-required configuration filenames retain their integration names.
- Put one component in each component file and one top-level utility function in each utility file. Closures, reducers, event handlers, and callbacks remain with their owner when they need its scope. Extract reusable logic into a named function file.
- Keep each component declaration at most 125 lines (imports and separate prop types do not count). Split large views into focused components and compose their lifecycle/editing behavior from model hooks. Do not shrink formatting to bypass the limit.
- Use `@/` for imports rooted at `apps/studio/src`, for example `@/entities/workspace`. Vite and TypeScript share the mapping; the Node test runner registers the same alias. Keep explicit `.ts` extensions in code imported by native Node tests. Aliases do not bypass FSD public APIs.
- Pass named `useCallback` handlers for substantial event behavior, and `useMemo` for derived graphs, expensive calculations and reference-sensitive component props. Tiny argument-forwarding callbacks can stay inline. Keep dependency lists complete; do not suppress hook lint rules or memoize trivial values without a reason.
- Use `shared/i18n` for interface text. English and Russian catalogs have matching keys and interpolation variables; pluralized messages use `count`. The language picker saves a device preference and follows the browser language initially. Translate enum labels while preserving their canonical option values. Never translate or rewrite user-authored planning content.
- Give each type its own file under `types/`; expose types through `types/index.ts`. Use descriptive type names.
- Give each slice a public `index.ts`; use `ui/index.tsx` and segment `index.ts` barrels. Import other slices through their public API. Within a slice, import leaf files directly to avoid barrel cycles. Pure Node tests may import the exact function under test.
- Follow downward FSD dependencies: app → pages → widgets → features → entities → shared. Do not import a different slice on the same layer. Keep app composition in app and page composition in pages.
- Use `ui`, `model`, `utils`, and `types` segments. Within model, put generator workers in `iterators`, transport functions in `requests`, watchers/lifecycle orchestration in `saga`, Redux Toolkit slices in `slices`, and derived state in `selectors`. Create a segment when it contains actual code, not as an empty placeholder.
- Application state belongs in named Redux Toolkit slices. Long-running editor workflows use Redux-Saga generator functions (`function*`, `call`, `put`, cancellation and debounce effects). Components invoke workspace model commands for document persistence. Authentication SDK callbacks and short profile/access forms keep their browser lifecycle handling next to their owner.
- Stores are scoped to their owner: app authentication, a mounted workspace, or a mounted editor/form. Model hooks subscribe through `useSyncExternalStore`, and expose stable named commands. This avoids leaking selections, forms, follow sessions, or undo state into another board/workspace. State factories live in model files, not UI.
- Keep Redux state serializable. Multi-selection and dragging IDs are arrays in the store; memoized selectors expose Sets for canvas rendering. Evaluate functional updates before dispatching a plain payload. Never store sockets, React Flow instances, DOM elements, timer handles, or functions in Redux.
- The four checked local-state exceptions are React Flow instance handles in the two board controller hooks, animation-frame interpolation in `useLiveNodePositions`, and the one-time secret in `AgentAccess`. They are rendering handles or private transient material, not shared application state. Keep secrets out of Redux, persistence and developer instrumentation.
- Keep pending writes and conflict recovery safe: use revision-checked operations, preserve unsaved drafts, refuse to replay stale removals, keep cameras local, and avoid cancelling a commit merely because a later edit restarts debounce. Saga lifecycles clean up their sockets, timers and subscriptions on unmount.
- The shared domain package and MCP package use the same one-function/type-per-file convention with camelCase modules and public index barrels. Server utility helpers live in separate files; route factories own their request handlers. The frontend layer taxonomy does not apply to Node entrypoints.

`pnpm check:architecture` checks naming, one-function/component files, the 125-line component limit, substantial inline JSX callbacks, type files, FSD boundaries (including aliases), slice public imports, export-only barrels, and the limited `useState` exceptions. `pnpm lint` includes this check and React hook dependency checks. Run `pnpm test` and `pnpm build` before shipping changes. Tests must use fixtures or isolated database schemas; the normal local environment shares production Postgres.

## Interface typography

Use the shared `Text` component for interface copy. Its `as` prop preserves semantic HTML (headings, paragraphs, labels, table cells and inline emphasis); refs and accessibility attributes pass through. Use the body, label, caption, title and heading variants for new layouts. Keep existing contextual styles when migrating, and use the shared caption token instead of 9–11px interface text.

Native input/textarea values, option strings, SVG geometry labels, Markdown source passed to the parser and the static pre-React loading screen are integration exceptions. Rendered Markdown headings and prose use Text. Do not alter user-authored content or a design layer's saved font settings to enforce interface typography. `pnpm lint` includes `checkTypography.mjs` to prevent direct semantic text elements and tiny CSS labels from returning.
