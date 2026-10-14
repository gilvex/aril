import type { ReleaseEntry } from '../types/releaseEntry.ts'

// Newest first. See docs/changelog.md before adding a release.
export const releases: ReleaseEntry[] = [
  {
    id: '2026-10-14-language',
    date: '2026-10-14',
    title: 'A simpler language menu',
    summary: 'Switch between English and Russian from a compact globe button.',
    changes: [
      'Native language names and a checkmark make the current language clear. Keyboard navigation, saved preferences, and a 44px button work across the studio.',
      'Mouse selection leaves no lingering focus outline; keyboard navigation keeps a visible focus indicator.',
    ],
    image: '/changelog/language-menu.webp',
    imageAlt: 'Aril home page with the globe language menu open, showing English and Русский.',
  },
  {
    id: '2026-10-14-home',
    date: '2026-10-14',
    title: 'A clearer introduction to Aril',
    summary:
      'Explore the studio, try the demo, and sign in from the new home page.',
    changes: [
      'A charcoal and berry home page with original halftone artwork, studio previews, and a playable demo tour.',
      'The berry halftone ribbons now flow in gentle waves. Pause the background at any time; reduced-motion preferences keep it still.',
      'Explore Canvas and Design without an account, or jump straight to Google sign-in. Invitation and account-switching links still open their focused forms.',
      'Responsive layouts, English and Russian copy, keyboard navigation, and reduced-motion support.',
      'Specific descriptions replace generic slogans. Home-page text, including captions, sign-in help, and preference menus, is at least 14px.',
    ],
    image: '/changelog/home-readable.webp',
    imageAlt:
      'Aril home page with direct product descriptions, readable navigation, and animated berry halftone ribbons.',
  },
  {
    id: '2026-10-14-account-mcp',
    date: '2026-10-14',
    title: 'One agent connection, all your files',
    summary:
      'Connect an MCP client to your account and switch files without reconnecting.',
    changes: [
      'Agent access now offers account-wide or single-file credentials. Every file keeps its own editor and viewer permissions.',
      'MCP can list accessible files and target each read or edit explicitly, keeping simultaneous requests separate.',
      'The MCP server, companion skill, packages and new configuration now use Aril names. Older credentials and configuration remain compatible.',
      'Existing file credentials stay file-only. Create an account credential and run setup once to enable access across files.',
    ],
    image: '/changelog/account-agent-access.png',
    imageAlt:
      'Agent access settings in the isolated demo, showing account or single-file access, permissions and expiry.',
  },
  {
    id: '2026-10-14-engineering',
    date: '2026-10-14',
    title: 'Engineering notes and repeatable checks',
    summary:
      'Explore the studio’s engineering decisions, current access model, and reproducible verification.',
    changes: [
      'A shorter README links to the studio guide, a collaboration case study, and backup and rollback procedures.',
      'Automated checks now include a disposable Postgres job, a local contention benchmark, and a SQLite restore drill.',
      'Access and collaboration documentation now reflects viewer roles, member removal, and live note editing.',
    ],
    image: '/changelog/canvas.webp',
    imageAlt:
      'Demo architecture board with connected services and live collaborator cursors.',
  },
  {
    id: '2026-10-11-changelog',
    date: '2026-10-11',
    title: 'A home for what’s new',
    summary:
      'Follow Aril’s progress with illustrated release notes and a quick tour of the studio.',
    changes: [
      'A public changelog, available from sign-in and App settings, with direct links to each update.',
      'The README now includes real demo screenshots and an animated walkthrough of Canvas, Design and Library.',
      'Playable screen recordings replace still-only release media. The README GIF now shows continuous browser interactions.',
      'Future changes are documented alongside the code, with screenshots for visual updates.',
    ],
    video: '/changelog/studio-tour.mp4',
    videoAlt: 'Watch the studio workflow: Canvas, Design, and Library.',
    image: '/changelog/canvas.webp',
    imageAlt:
      'Demo architecture board with connected services and live collaborator cursors.',
  },
  {
    id: '2026-10-11-asset-details',
    date: '2026-10-11',
    title: 'Asset details, with room to work',
    summary:
      'Inspect a component, follow its variables and find its usages without losing your place.',
    changes: [
      'Separate Details and Usage views, component previews, variant selection and links to bound variables.',
      'Search usages by layer, page, property or variant, then open the matching layer in Design.',
      'Drag and resize asset details across the Library workspace, or dock beside the sidebar or at the right edge.',
      'On mobile, details open in a scrollable drawer with actions above the bottom navigation.',
    ],
    video: '/changelog/asset-details.mp4',
    videoAlt:
      'Watch asset details move, resize, preview variants and filter usages.',
    image: '/changelog/asset-details.webp',
    imageAlt:
      'Library asset details showing a component preview, properties and a bound variable.',
    commit: '2eddb73bb570f52986dca8107a857e00bdfcb645',
  },
  {
    id: '2026-10-11-library-map',
    date: '2026-10-11',
    title: 'Explore the connections in your library',
    summary:
      'Move from a library overview to the assets you need, while keeping the graph in context.',
    changes: [
      'Components, variables and pages are organized into libraries and families, with search and bounded results.',
      'Reveal connected groups in the same graph. Selection highlights related assets and dims the rest.',
      'Components support custom symbols and shape-based icons. Shared controls use Vagabond button groups.',
      'State-machine authoring and Wireframes navigation are retired; existing legacy data is preserved.',
    ],
    video: '/changelog/library.mp4',
    videoAlt: 'Watch a library group expand directly in the graph.',
    image: '/changelog/library.webp',
    imageAlt: 'Library map with connected asset groups revealed in place.',
    commit: 'a708366',
  },
]
