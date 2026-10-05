---
name: pomegranate-project-prep
description: Plan and set up Pomegranate as a large React application. Use for project discovery, framework selection, architecture decisions, initial tooling, or implementation planning; not for routine UI edits.
---

# Pomegranate project preparation

## Known context

The user wants a large React app and likes Juxtopposed's designs. Next.js with Feature-Sliced Design and Astro were suggestions, not final decisions. The product domain, backend, rendering needs, deployment target, and team size are still unknown. Size alone does not decide the framework. The initial skill installation did not scaffold an app.

## Resolve the consequential decisions

Read existing project documents and manifests first. Establish the main user journeys, public versus authenticated routes, data ownership, and hosting constraints from available context. Ask only for missing information that materially changes the choice. State reversible assumptions and continue independent preparation.

Compare:
- Next.js App Router when the product benefits from server rendering, public discoverable pages, and integrated server capabilities.
- React with Vite and an appropriate router when an authenticated client application talks to an existing backend and server rendering adds little value.
- Astro when content delivery dominates and interactive React elements are localized. Consider a separate Astro marketing/docs surface if useful; a large React product does not automatically need a second framework.

FSD is a code organization methodology, not a competing framework. Use the installed feature-sliced-design skill for boundaries and its framework integration reference for route placement. Start with the layers that contain real code. Record the decision and its tradeoffs in docs/architecture.md, including what new evidence would change it.

## Make the work executable

Produce a short plan in docs/implementation-plan.md: user-visible first milestone, scope, dependencies, affected paths, acceptance criteria, and unresolved decisions. Plan one vertical user journey through real loading, empty, error, and success states before broad feature scaffolding. Match planning depth to the request; no mandatory approval ceremony or subagent workflow.

For initial design, use the local juxtopposed-inspired-design skill and frontend-design as needed. Record selected tokens and component conventions in docs/design.md after actual design work. Do not derive a red palette or fruit branding solely from the project name.

## Setup when implementation is requested

1. Inspect existing files and preserve them, especially .agents/skills. In a folder containing only skills, generate into a temporary sibling/workspace subdirectory when the official scaffolder requires an empty target; merge deliberately without overwriting skill files.
2. Use the chosen framework's current official generator and documentation. Check compatible Node and package-manager versions; record them and keep one lockfile. Prefer TypeScript strict mode. Do not run unrelated cloud provisioning.
3. Establish only the necessary paths, formatting, linting, type checking, environment template, and start/build commands. Separate server-only configuration from browser-exposed values.
4. Apply FSD boundaries using the official skill. For Next.js, resolve its app/pages naming conventions through that skill's framework-integration reference before creating folders.
5. Give the first journey behavioral tests and an appropriate browser smoke check. Add component documentation/Storybook when shared component work makes it useful; do not generate placeholder tests for configuration alone.
6. Run the actual lint/type/build scripts and relevant behavior checks. Document exact local startup commands, required environment variable names, and any unresolved verification gaps in README.md.

Read version-matched framework documentation before coding APIs. The former next-best-practices skill was retired in favor of Next.js bundled documentation; consult the current AI-agent setup guide instead of installing a stale copy.

## Sources

- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/guides/ai-agents
- https://vite.dev/guide/
- https://docs.astro.build/en/concepts/why-astro/
- https://feature-sliced.design/docs/guides/tech/with-nextjs
- https://github.com/vercel-labs/next-skills

This is a custom project skill written for Pomegranate, not an upstream framework skill.
