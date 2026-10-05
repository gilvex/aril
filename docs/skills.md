# Pomegranate skill installation

Installed and validated on 2026-10-05. Scope: this project, in `.agents/skills/`; no global skill installation or application scaffold.

## Selected skills

| Skill invocation | Purpose | Source |
| --- | --- | --- |
| `$frontend-design` | Distinctive visual design, typography, layout, and critique | [Anthropic](https://github.com/anthropics/skills/tree/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4/skills/frontend-design) |
| `$vercel-react-best-practices` | React performance and data-loading guidance | [Vercel](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices) |
| `$vercel-composition-patterns` | Maintainable component APIs and composition | [Vercel](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/composition-patterns) |
| `$web-design-guidelines` | UI and accessibility reviews | [Vercel](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/web-design-guidelines) |
| `$feature-sliced-design` | Official FSD guidance, boundaries, and framework integration | [Feature-Sliced](https://github.com/feature-sliced/skills/tree/fd71da42a89e916f2ced63e5349fd865c87070a6/feature-sliced-design) |
| `$pomegranate-project-prep` | Product discovery, stack selection, planning, and setup | Custom project skill, based on official framework documentation |
| `$juxtopposed-inspired-design` | User's visual preference, interpreted for a large React app | Custom and unofficial; [source notes](../.agents/skills/juxtopposed-inspired-design/references/sources.md) |

The five upstream skill directories were installed at exact commit revisions using the bundled skill installer, including their supporting resources. Upstream files were not edited. The two custom skills are original project instructions and are not attributed to upstream authors. `skills-lock.json` records sources and SHA-256 file hashes for the installation snapshot; it is an audit record, not a package-manager lockfile.

## Why this set

It separates visual direction, design review, React implementation, architecture, and preparation. The large-project requirement makes module boundaries and component composition useful. Setup guidance is custom because no framework or hosting provider has been selected; it avoids prematurely imposing cloud provisioning or an outdated starter template.

Next.js plus FSD is a candidate for a product needing server rendering and integrated server capabilities. React/Vite remains a candidate for a client application using an existing backend. Astro is a candidate when the core experience is content-led. These are decision criteria, not a final architecture recommendation. Sources: [Next.js](https://nextjs.org/docs/app), [Vite](https://vite.dev/guide/), [Astro](https://docs.astro.build/en/concepts/why-astro/).

The former `next-best-practices` skill has been retired in favor of bundled framework documentation. Consult the [migration notice](https://github.com/vercel-labs/next-skills) and [Next.js agent setup guide](https://nextjs.org/docs/app/guides/ai-agents) when choosing and installing Next.js.

## Juxtopposed findings

No official agent skill was identified in the checked [portfolio](https://www.juxtopposed.com/), public GitHub repository listing, or targeted web search. Her [Realtime Colors](https://www.realtimecolors.com/) and [Stack Sorted](https://stacksorted.com/) projects were inspected directly. The custom skill captures a preference and an original workflow; it does not contain her code, assets, paid designs, or video transcripts. It is not endorsed by her. Specific favorite redesign videos can refine it later.

## Use and verification

The skills should be available on the next turn in this workspace. For example:

```text
Use $pomegranate-project-prep to research the architecture for Pomegranate.
Use $juxtopposed-inspired-design to explore the product's visual direction.
Use $feature-sliced-design to organize this feature.
```

All seven skills passed the bundled skill-creator metadata/frontmatter validator. Supporting resources were included by the installer. Validation confirms file structure and metadata, not design quality or future application behavior. The validator's missing PyYAML dependency was installed only in a temporary directory.

For updates, compare upstream revisions and preserve custom files. The installer refuses to overwrite existing skill directories; do not delete the entire skills directory to update one skill.
