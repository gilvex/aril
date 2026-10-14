# Operating Aril

## Current evidence

The repository provides a liveness endpoint, persistence/access integration tests, a fixture-only SQLite restore drill, and a local contention benchmark. This document is an operating procedure, not a claim that production alerting, SLOs, automated off-site backups, or Postgres restore drills are already configured.

## Health and diagnosis

- `GET /api/health` should return `200` and `{ "ok": true }`. It confirms the HTTP process responds; the handler does not query the database.
- Check deployment/runtime logs for startup failures, database connection interruptions, and unexpected 5xx responses. Do not log bearer tokens, invitation links, document bodies, or account credentials.
- A growing rate of `409` on writes indicates revision or field conflicts; inspect concurrent editing and retry behavior before treating it as an outage. `428` means an obsolete client protocol and calls for a reload after preserving unsaved work. `401`/`403` require session/membership investigation.
- For a functional check, use a dedicated fixture workspace to read, edit, reload, and observe from a second session. Production smoke utilities require explicit administrator execution; they are not ordinary CI commands.

For an operated deployment, configure an external liveness probe plus a fixture-based read/write check, and alert on sustained failures. Track API error rates, save latency, conflict/retry rate, database connections, and reconnect frequency. Choose thresholds after measuring the deployed workload; none are promised here.

## SQLite backup and restore

1. Stop the process that writes the database. Confirm the configured `POMEGRANATE_DATA_DIR`; the default is `data`.
2. Copy the entire data directory to a separate, dated backup location. Include any remaining WAL/SHM files. Keep the backup private because it contains documents and identity/session records.
3. Record the application commit/runtime and backup timestamp. Keep a copy outside the application host according to the deployment's retention requirements.
4. Restore by copying the backup into a **new** directory. Do not overwrite the current database while evaluating recovery.
5. Run SQLite `PRAGMA integrity_check` on the restored database and expect `ok`.
6. Start a compatible application version against the restored directory on a separate loopback port. Verify documents/revisions, history, membership, and a write/reload using an isolated test copy. Avoid opening two application processes on the same SQLite database.
7. Only after verification, stop the test process and switch the service to the restored directory. Retain the previous copy for investigation.

`pnpm verify:recovery` automates the copy/integrity/reopen checks against generated data, including sessions, owner role, history, activity, deduplication receipt, and a post-restore write. It never reads the configured application data or `.env`. CI retains `artifacts/verification/recovery.json`.

This drill validates a cleanly stopped local SQLite fixture. It does not test crash-consistent snapshots or establish production recovery time/data-loss objectives.

## Postgres backup and restore

Use the hosting provider's documented backups/PITR where available, or a consistent `pg_dump` of the private `pomegranate` schema with a compatible client. Store backups privately and preserve the application commit and database version. A document JSON export alone omits identities, memberships, receipts, and history.

Restore into a separate disposable database first. Check schema ownership/permissions, workspace counts, document revisions, history, and access denial for non-members. Verify a write from one application instance is visible to another. Realtime authorization policies and signing configuration are separate deployment configuration and must be checked independently.

The Postgres CI job tests consistency and access against PostgreSQL 17; it is not a hosted backup/restore or Supabase WebSocket test. A full hosted restore drill remains to be performed and recorded before making recovery guarantees.

## Rollback

1. Record the failing commit, error symptoms, and database/schema version. Preserve conflicting browser drafts before a required reload.
2. Check whether the previous application supports the current document schema, editor protocol, and database additions. Do not assume reverting code safely reverts stored data.
3. Redeploy a previously verified compatible build through the hosting platform; for self-hosting, install/build that commit with its lockfile and restart against the existing compatible database.
4. Run liveness and isolated functional checks, including a save/reload and second-session visibility. Monitor errors and conflicts.
5. If compatibility requires data restoration, follow the verified backup procedure and explicitly account for writes since that backup. Keep the failed-state copy for recovery/investigation.

Write a short incident record: impact, timeline, cause, recovery, and one concrete regression-prevention action. No production rollback or hosted recovery has been performed as part of the local verification scripts.
