# Pomegranate

The user intends a large React deployment platform: open-source/self-hostable plus SaaS and IaC. The explicitly accepted first deliverable is a persistent planning studio for architecture, user flows, requirements, and design exploration. It is implemented with React, TypeScript, Vite, React Flow, Express, and Node 24 SQLite. This does not settle the eventual deployment platform's stack.

Read README.md and docs/product-brief.md for current scope. Run `pnpm dev` for the studio, and `pnpm lint`, `pnpm test`, and `pnpm build` for checks. Keep data/studio.sqlite and its WAL files out of Git. Preserve user planning data and installed skills. Do not reset the database to update starter content.

The user likes Juxtopposed's designs. The project-local `juxtopposed-inspired-design` skill records an unofficial interpretation of that preference and its sources. Product requirements and later user preferences take precedence.

## Local skills

Skills are installed under `.agents/skills/`. Read only those relevant to the task:

- Planning, framework selection, and initial setup: `pomegranate-project-prep`.
- Visual direction: `juxtopposed-inspired-design`, with `frontend-design` for broader design guidance.
- FSD structure and framework integration: `feature-sliced-design`.
- React performance: `react-best-practices` (skill name `vercel-react-best-practices`).
- Component API design: `composition-patterns` (skill name `vercel-composition-patterns`).
- Requested UI/accessibility reviews: `web-design-guidelines`.

See `docs/skills.md` for provenance, scope, and explicit invocation examples. The frontend uses a small FSD structure; do not add empty layers or cross-slice imports without a concrete need. The studio supports invite-only collaboration, isolated workspaces and optional Google-linked accounts; read docs/collaboration.md and docs/accounts-and-deployment.md before changing access or concurrency. Deployment execution, granular roles, and distributed storage/realtime remain future work. Preserve the additive SQLite migration and existing workspace memberships.
