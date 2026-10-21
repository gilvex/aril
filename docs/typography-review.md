# Interface typography review — 2026-10-22

Reviewed React interface text and CSS against the project's design rules and the typography, accessibility and content-handling sections of [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). This is a focused typography review, not a full accessibility certification.

- Added shared Text with semantic tags, inherited styling, explicit size/tone variants and ref/ARIA forwarding. Migrated interface headings, paragraphs, labels, inline copy and string-valued JSX.
- Replaced 9–11px CSS interface labels with the 12px caption token. Headings balance wrapping; prose uses pretty wrapping; code and long labels can wrap.
- Normalized displayed ellipses while retaining translation keys, canonical enum values and user-authored content.
- Replaced fragmented MCP setup sentences with complete translated steps and separate commands. Labels, dropdowns and error status remain semantic.
- Markdown input stays a string; its rendered headings and prose use Text. Native values/options, SVG labels and pre-React HTML retain their required representations.

Validation: type checking and production build; catalog parity and existing unit tests; isolated browser scenarios covering loading, canvas, notes, requirements, desktop/mobile icon selection and agent setup. The fixture recording contains no real credentials or private workspace data.
