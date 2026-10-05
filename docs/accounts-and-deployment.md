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

## Deployment status and requirements

The current backend uses native SQLite on persistent disk and in-process SSE presence. It is supported as a **single long-running server** behind HTTPS; see [collaboration.md](collaboration.md). It is **not ready for a standalone Vercel Functions deployment**: Vercel's filesystem cannot durably store this database, and separate function instances would not share presence.

Before a complete Vercel deployment, provision a persistent database and shared realtime service (or host this backend on a persistent server and route Vercel's frontend API traffic to it). Adapt and verify the storage/realtime boundary against that provisioned service. Do not deploy the Vite output alone as though the API and collaboration work.

Publishing also requires GitHub repository-creation access (`gh auth login`) and Vercel project access. The requested repository must be **private**. `.gitignore` excludes the database and backups, artifacts, environment values, pnpm cache, dependencies and Vercel local metadata. Do not upload local sessions, account bindings or live planning data as source code.

After services are configured, validate invitations, Google linking and subsequent sign-in, workspace isolation, autosave, simultaneous collaboration and reconnects on the actual deployed URL before treating the deployment as complete.
