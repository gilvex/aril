# Case study: preserving edits in a collaborative planning studio

## Problem and ownership

Aril combines architecture diagrams, interface designs, requirements, and notes in a persistent workspace. A save must survive restart, reject unauthorized access, and avoid silently overwriting another person's work. The same document is editable through the browser and scoped automation tools.

This is a solo-maintained product by [gilvex](https://github.com/gilvex). The repository demonstrates end-to-end implementation and verification across the editor, API, domain model, and storage adapters. It does not establish team size, production user counts, or commercial impact.

## Constraints and decisions

| Constraint                                       | Decision                                                                                                      | Cost or alternative                                                                                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Simple self-hosting and shared cloud storage     | SQLite for one process; Postgres for shared instances, behind the store contract                              | Two adapters require behavioral coverage. A cloud-only database would simplify maintenance but remove the zero-service local setup.                                                 |
| Avoid lost updates                               | Protocol/version checks, base revisions, operation preconditions, and atomic snapshot/activity/receipt writes | Workspace-wide revision contention can reject independent edits; clients must refresh/rebase or preserve a conflicting draft. Blind last-write-wins would be simpler but lose work. |
| Recover local work after a conflict              | Preserve per-tab drafts and offer export/reload; inverse operations protect personal undo                     | More recovery UI and state complexity than always accepting the latest server snapshot.                                                                                             |
| High-frequency presence is transient             | Separate signed WebSocket presence from durable saves; SQLite uses in-memory POST/SSE                         | Two transport paths and bounded stale-presence windows, instead of persisting every pointer movement.                                                                               |
| Character-level collaboration is useful in notes | Yjs text updates for note bodies; plain Markdown and CRDT metadata saved together                             | CRDT state and reconnect handling are additional complexity. Ordinary fields retain conflict checks rather than applying CRDTs to the entire document.                              |
| Automation needs bounded authority               | Workspace-scoped credentials use shared validation and persistence rules                                      | Tools must reread stale revisions; convenience does not bypass document or membership checks.                                                                                       |

The editor uses Vite because interactive editing is the primary workload and SSR is not a current requirement. The frontend's scoped Redux/Saga models keep editor lifecycles and pending saves explicit. [Architecture](architecture.md) and [convention rationale](code-rules.md#why-these-conventions) describe the boundaries and their costs.

## Evidence

- [HTTP collaboration test](../apps/studio/server/collaboration.test.ts): two live streams, independent edits, stale competing writes, request deduplication, permissions, and restart persistence.
- [Postgres integration test](../apps/studio/server/postgres.test.ts): two API instances, revision races, refresh/retry, invitation races, agent revocation, viewer enforcement, and cross-workspace denial.
- [Freshness](../apps/studio/server/freshness.test.ts) and [Redux](../apps/studio/server/redux.test.ts) tests: protocol/draft protection and editor save/undo behavior.
- [CI](../.github/workflows/ci.yml): separate default and disposable-Postgres jobs, plus recovery and contention reports. No production secrets are required.
- [Recovery drill](../scripts/verifyRecovery.ts): a stopped SQLite fixture is copied, reopened, integrity-checked, and verified for document, revision, history, session, membership, activity, receipt, and a subsequent write. The source remains unchanged.

## Measured local baseline — 2026-10-14

Command: `pnpm benchmark:collaboration`. Windows, Node v24.10.0, Intel Core i9-13980HX, 32 logical CPUs. Each scenario uses a fresh seeded SQLite workspace of approximately 18 kB and 20 edits per simulated client. Clients edit distinct note bodies through HTTP GET/PATCH. One read warms the path; reported logical-edit latency includes reads and all immediate retries after HTTP 409.

| Concurrent clients | Completed edits | Conflict responses | Edits/s | p50      | p95      | Maximum     |
| ------------------ | --------------- | ------------------ | ------- | -------- | -------- | ----------- |
| 1                  | 20              | 0                  | 160.08  | 5.06 ms  | 9.31 ms  | 21.76 ms    |
| 4                  | 80              | 120                | 118.05  | 8.01 ms  | 17.11 ms | 599.79 ms   |
| 8                  | 160             | 560                | 88.83   | 11.04 ms | 23.57 ms | 1,728.83 ms |

All edits completed and the final revision and every client's final value were checked. **The maximum matters:** immediate retries let some clients repeatedly lose revision races even when p95 looks low. An initial harness budget of 100 attempts was exhausted in the eight-client scenario; the final bounded budget allows for every competing write in the fixture. This identifies a fairness/latency investigation, not a reason to weaken conflict protection. A follow-up experiment should compare retry backoff/jitter and the actual browser autosave schedule before changing the production algorithm.

This is one short local run, not a sustained-load benchmark or production capacity estimate. Clients and server share one process/machine. Browser rendering, SSE observers, TLS, network latency, large documents, Postgres, and Supabase delivery are outside the workload. No before/after speedup is claimed. The script writes timestamped machine-readable results to `artifacts/verification/collaboration.json`; CI retains its own reports as artifacts.

The generated SQLite restore drill also passed locally. Its small-fixture timing is not an RTO/RPO promise. See [operations](operations.md) for the procedure and deployment-specific checks still needed.

## Remaining work

1. Measure real editor contention, larger documents, observer fan-out, and long-lived sessions.
2. Verify Postgres restore and hosted socket behavior in a disposable deployment matching production configuration.
3. Establish monitored availability/error/latency objectives from an actual operating workload.
4. Collect user feedback and adoption data before claiming product impact.

The transferable result is a documented, testable consistency/recovery model across two storage backends, with a reproducible experiment that exposes a concrete limitation.
