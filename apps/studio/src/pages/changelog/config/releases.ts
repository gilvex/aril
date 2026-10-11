import type { ReleaseEntry } from '../types/releaseEntry.ts'

// Newest first. See docs/changelog.md before adding a release.
export const releases: ReleaseEntry[] = [
  {
    id: '2026-10-11-changelog',
    date: '2026-10-11',
    title: 'A home for what’s new',
    summary:
      'Follow Aril’s progress with illustrated release notes and a quick tour of the studio.',
    changes: [
      'A public changelog, available from sign-in and App settings, with direct links to each update.',
      'The README now includes real demo screenshots and an animated walkthrough of Canvas, Design and Library.',
      'Future changes are documented alongside the code, with screenshots for visual updates.',
    ],
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
    image: '/changelog/library.webp',
    imageAlt: 'Library map with connected asset groups revealed in place.',
    commit: 'a708366',
  },
]
