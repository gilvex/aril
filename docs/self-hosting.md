# Self-hosting on one server

`deploy/vps/compose.yaml` runs Aril as one long-running studio process with a private Postgres 17 database and daily `pg_dump` backups. The image is built from the repository `Dockerfile` and also serves the built frontend.

`ARIL_LIVE_TRANSPORT=local` makes the Postgres store use the same in-memory live transport as SQLite. Saves, presence, cursors and note text are pushed directly to open browsers over authenticated SSE/POST. There is no database polling and no Supabase Realtime dependency. This mode requires exactly one studio process: a second process would not see the first process's live clients. The in-memory transport accepts up to 64 live connections.

Hosted Vercel deployments keep the previous behavior: Postgres document streams plus private Supabase WebSocket channels (see [accounts-and-deployment.md](accounts-and-deployment.md)).

## Install

1. Copy `deploy/vps/.env.example` to `.env` beside `compose.yaml`. Generate `ARIL_DB_PASSWORD` with `openssl rand -hex 24`. Set `ARIL_ORIGIN` to the public HTTPS origin and list any further exact origins in `ARIL_ADDITIONAL_ORIGINS`. Optional sign-in providers, invitation email and branding settings from the root `.env.example` go in the file named by `ARIL_APP_ENV_FILE`.
2. `docker compose up -d --build` from `deploy/vps`. Postgres is reachable only on the Compose network; the studio publishes `127.0.0.1:${ARIL_PORT}`.
3. Put an HTTPS reverse proxy in front, for example Caddy:

   ```
   www.aril.studio, aril.studio {
   	reverse_proxy 127.0.0.1:4317 {
   		flush_interval -1
   	}
   }
   ```

   `flush_interval -1` keeps live event streams unbuffered. Compose sets `ARIL_TRUST_PROXY=loopback,uniquelocal` (an Express trust-proxy value) so guest-link rate limits see client addresses forwarded by the proxy. Only trust proxies that overwrite `X-Forwarded-*` headers, as Caddy does by default.

4. Add every public origin to the Google OAuth client's Authorized JavaScript origins.
5. Check `https://<origin>/api/health`.

On first start the studio creates its schema and an empty default workspace. Use `docker compose exec app node scripts/invite.ts` (from `/app`) to create the first invitation, or import existing data as below.

## Import from Supabase/another Postgres

Stop writes on the old deployment first, or accept that later edits there are not copied. Dump only the application schema with a `pg_dump` at least as new as the source server, then restore it into the stopped studio's database:

```sh
docker compose stop app
docker run --rm -e PGPASSWORD=... postgres:17-alpine \
  pg_dump -h <source-host> -U <user> -d postgres -n pomegranate -Fc --no-owner --no-privileges > aril-import.dump
docker compose exec -T db pg_restore -U aril -d aril --no-owner --no-privileges --clean --if-exists < aril-import.dump
docker compose start app
```

`--clean` replaces the `pomegranate` schema in the new, otherwise empty database; never point it at a database whose data you need. Verify workspace revisions and row counts against the source before switching DNS. Sessions, Google links, memberships, invitations and agent credentials move with the schema, so existing browsers stay signed in once the same domain points at the new server.

## Backups and restore

The `backup` service writes `aril-<UTC timestamp>.dump` to `ARIL_BACKUP_DIR` daily and keeps the newest 14. Copy them off the host as well. To restore, stop `app`, run `pg_restore --clean --if-exists` into `db` as above, then start `app`. Restoring an older image does not roll back the database.

## Updating

Pull or copy the new source, then `docker compose up -d --build app`. Take a manual dump first (`docker compose exec db pg_dump -U aril -d aril -Fc > before-update.dump`). Schema changes are additive and run on startup.
