# Public demo

The sign-in page links to `/?demo=1&workspace=demo&board=layers&view=canvas`. The application installs a local transport **before mounting React**. The existing Redux/Saga editor and save pipeline then use the same operations, validation, revision checks, undo/redo and history UI as a real workspace.

The transport owns a private in-memory copy of authored sample data and persists demo documents/history to `sessionStorage` under `aril-demo-v1`. It never opens a database connection, reads a real session token, creates a user, or falls through to an HTTP request. Unknown actions and workspace IDs are rejected. The real server's access checks remain unchanged. Existing invitation/transfer fragments and legacy real-workspace drafts are ignored in demo mode. Demo exit never logs out the real account.

Four seeded blueprint boards cover deployment recipes, platform architecture, first deployment and product structure. The deployment board adds six connected wireframe screens. Requirements span every status/priority, and the notebook includes a guide, decisions and release checklist. All of these examples are independently generated; no live workspace content is copied.

Maya and Noah are explicitly labeled simulated teammates. A cancellable in-browser event stream drives cursors, selections, camera following and sample activity. No presence traffic goes to Postgres or WebSockets. They do not modify the document. Profile edits affect only the current demo session; account linking and invitations are disabled, and unsupported account/agent/workspace-creation requests explain that a real workspace is needed.

Reset removes only the demo document, its recovery draft and its camera preference. It does not touch real profiles, sessions, workspace documents or saved recovery drafts. Demo document edits survive refresh in the same tab. Closing the tab normally ends that sandbox; browser session restoration can retain session storage. Export remains available for keeping a copy.

`server/demo.test.ts` verifies the sample schema, recipe connections, varied requirements, local persistence, stale-write rejection, history, isolation, blocked network fallback, cancelled event streams and storage failure behavior. Browser verification covers entry without login, editing/refresh, wireframe flow preview, requirements, simulated following and mobile layout.
