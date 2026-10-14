# Contributing to Aril

Start with the [README](README.md), [architecture](docs/architecture.md), and [code conventions](docs/code-rules.md). Node 24+ and the pinned pnpm version are required.

## Propose a change

For a bug, include reproduction steps, expected/actual behavior, browser/runtime versions, and a minimal fixture. For a design change, describe the user problem, constraints, alternatives, and compatibility implications before expanding the implementation.

Keep PRs focused. Explain the decision and link evidence rather than just listing edited files. Document how saved documents, concurrent editors, and existing clients behave after the change.

## Local verification

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

Tests use temporary databases. A developer's `.env` may point to production: do not load it for tests, benchmarks, or restore drills. Use a disposable Postgres database for the optional integration suite; see [verification](docs/verification.md).

For persistence changes, also run `pnpm verify:recovery`. For save-path performance changes, run `pnpm benchmark:collaboration` and attach the generated report with machine/workload details. Do not compare unlike workloads or treat a single local run as a production capacity estimate.

## Review checklist

- State the problem and explain the chosen trade-off.
- Include regression coverage for changed behavior and failure paths.
- Preserve revision checks, recoverable drafts, access isolation, and stored-data compatibility.
- Follow the existing public module boundaries and documented state exceptions.
- Update current documentation and the [public changelog](docs/changelog.md) when behavior changes.
- Use demo fixtures for screenshots and reproduction; omit credentials and private workspaces.

CI verifies lint, tests, builds, SQLite recovery, and the isolated two-instance Postgres contract. Hosted Google sign-in and Supabase WebSocket delivery remain separate environment-dependent checks.
