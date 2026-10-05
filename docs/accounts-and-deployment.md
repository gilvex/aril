# Workspaces and accounts

The home screen lists only workspaces you belong to. Create a workspace with a name, then invite collaborators using **People → Create invite link** inside it. New workspaces start with one empty board. Selecting the workspace name in the sidebar returns to the list after saving. If a save fails or conflicts, switching is stopped so you can resolve or export the draft.

Invitations grant access to exactly one workspace, expire after 24 hours and work once. Opening an invitation while signed in adds membership to your existing profile. Each workspace has separate documents, revisions, activity, receipt IDs and live collaboration streams. Browser recovery drafts and cameras are scoped to both profile and workspace.

The SQLite migration retains the original tables and copies the existing Pomegranate document, snapshots and activity into the default workspace. All profiles that existed at migration time keep access. Subsequent profiles are only added by invitation or workspace creation. Owner/member labels identify who created the workspace; both currently have edit and invite permissions. Revocation and granular roles are not implemented.

## Google sign-in setup

1. In [Google Auth Platform](https://console.cloud.google.com/auth/clients), configure the consent screen and create a **Web application** OAuth client. Add the exact development and production URLs to **Authorized JavaScript origins** (for development, `http://127.0.0.1:5173`). If the app is in testing, add the intended users as test users.
2. Copy `.env.example` to `.env` and set `GOOGLE_CLIENT_ID` to the web client ID. No Google client secret is used by this ID-token flow. Restart the API. The client ID is public configuration; never put a client secret in frontend variables.
3. Existing invitees open their original signed-in browser, then **Profile → Keep your access → Continue with Google**. Linking preserves their profile, pictures and all workspace memberships.
4. On another browser/device, choose **Continue with Google** on the invitation/sign-in screen. Their existing workspaces return without a new invitation. New users must first accept a workspace invitation, then connect Google.

The server verifies Google's JWT signature, issuer, expiration, audience, verified email and one-use nonce with the official Google library. Accounts are keyed by Google's stable subject, never automatically merged by name or email. Linking requires the existing authenticated studio session. A Google identity already connected to a different profile is rejected. Account email is only returned to that user's private account endpoint, not broadcast in presence.

If an old guest session has expired before Google was connected, a new invitation is still necessary. Existing guest identities have no verified email that can safely be used to recover them automatically. Google sign-in remains visibly unavailable until the host configures the client ID; a live Google sign-in must be tested after configuration.

## Hosting and moving existing users online

The studio supports native SQLite for a single self-hosted process and Postgres for shared/cloud deployments. Set `POMEGRANATE_STORAGE=postgres` and `POSTGRES_URL` to use Postgres locally. Vercel's `api/index.js` loads the server bundle generated in `.server/` by `pnpm build` and always uses Postgres. The production origin is `https://pomegrenate.vercel.app`; the GitHub repository is private at `gilvex/pomegranate`.

Supabase credentials remain server-side. The app does not use browser Supabase keys or Supabase Auth; it retains the invited-profile and Google identity model. Tables live in a private `pomegranate` schema, without anonymous schema access. Supabase TLS connections verify certificates against the bundled public Supabase CA, downloaded from `https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt` (SHA256 `807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA`).

Postgres saves lock the document row and atomically commit snapshots, activity and request receipts. Conflicting revisions retry with a fresh document; same-field conflicts still stop. Shared presence rows track monotonic sequence numbers and stream leases. SSE checks changes at 250 ms intervals, sends document snapshots only when revisions change, and reconnects after 55 seconds to stay within the function duration. Stale presence expires after 30 seconds. Polling is suitable for this small planning studio; high traffic will need a dedicated realtime transport.

To migrate an existing SQLite installation, stop local writes, then run `node --env-file=.env scripts/migrate-cloud.ts`. This explicit administrator command makes a local SQLite backup, validates and copies all workspaces, history, profiles, memberships, Google links, invitations and hashed sessions into one Postgres transaction. It refuses to overwrite populated cloud data or repeat a completed import. Obtain approval before transferring private local data. After verification, switch the local API to Postgres so local and hosted clients share one authoritative database.

Set `POMEGRANATE_CLOUD_ORIGIN=https://pomegrenate.vercel.app` on the local server to display **Open hosted studio** on the workspace list. Signed-in local users receive a single-use, two-minute access link for their own migrated profile. Its token is carried in a URL fragment, removed before exchange, stored hashed in Postgres and consumed transactionally. The hosted browser receives a new session for the same profile; no new invitation or duplicate profile is needed. Then connect Google from the hosted profile panel to retain access on future devices.

The repository remains **private**. `.gitignore` excludes databases and backups, artifacts, environment values, pnpm cache, dependencies and Vercel local metadata. Never commit local sessions, account bindings or live planning data. `GOOGLE_CLIENT_SECRET`, database passwords and service-role keys must not be placed in frontend environment variables.

For an explicit deployment smoke test, set `SMOKE_ORIGIN` to the deployed origin and run `node --env-file=.env scripts/smoke-cloud.ts` with its database credentials. This creates isolated temporary profiles and a workspace, verifies transfer, invitations, membership isolation, live presence, persisted edits and reconnects, and removes only the generated fixtures. Google linking and subsequent Google sign-in require a real user's interactive check.
