import type { ReleaseEntry } from '../types/releaseEntry.ts'

// Newest first. See docs/changelog.md before adding a release.
export const releases: ReleaseEntry[] = [
  {
    id: '2026-10-21-invitations',
    date: '2026-10-21',
    title: 'Invitations, notifications and usernames',
    summary:
      'Invite teammates by email or username and let them accept or decline in Aril.',
    changes: [
      'Join workspace now opens a focused invite-link dialog. Notifications are available on the workspace home and in the editor.',
      'Owners can invite Editors or Viewers, with username search and exact-email lookup. Invitations are bound to the recipient and expire after seven days.',
      'Profiles get automatic usernames; change yours in account or User settings. Email delivery uses Resend when the server has a verified sender configured.',
    ],
    image: '/changelog/account-invitations.png',
    imageAlt:
      'Invitation notifications with Accept and Decline actions, captured using isolated demo accounts.',
  },
  {
    id: '2026-10-21-workspace-actions',
    date: '2026-10-21',
    title: 'Workspace actions in one menu',
    summary:
      'Rename and delete workspaces from a compact menu on workspace cards and in File settings.',
    changes: [
      'Open the ⋯ menu or right-click a workspace card. The same owner-only menu is beside the file name in Settings.',
      'Renaming updates the open tab. Deletion still requires the exact workspace name; settings actions wait for pending edits to save.',
    ],
    image: '/changelog/workspace-actions.png',
    imageAlt:
      'Workspace card with its Rename and Delete menu open, using isolated demo data.',
  },
  {
    id: '2026-10-21-studio-entry',
    date: '2026-10-21',
    title: 'Separate product home and studio entry',
    summary:
      'The public home and the working studio now have separate routes. Self-hosted installations open the studio directly.',
    changes: [
      'Vercel previews accept their exact deployment and branch addresses while preserving host checks and workspace authentication.',
      'Google sign-in keeps keyboard focus when its control resizes; browser checks cover the resize race.',
      'Sign in and manage workspaces at /app; the public home stays at / and editors keep their /w/... URLs. Invitations, guest access and account transfers retain their destinations.',
      'Self-hosted deployments hide the landing page by default. The configured aril.studio origin enables it, with an explicit runtime override for other deployments.',
      'A persistent source-code link is available in both modes, including mobile. Installed apps open the studio directly.',
      'Revoked guest links no longer hide active links from the management list. Regression checks cover entry routes, access controls and browser workflows.',
    ],
    image: '/changelog/studio-entry.png',
    imageAlt:
      'Isolated studio sign-in with configured providers, an example blueprint and a persistent source-code link.',
    video: '/changelog/studio-entry.mp4',
    videoAlt:
      'Continuous fixture recording moving from the public home to studio sign-in, changing language and finding the source-code link.',
  },
  {
    id: '2026-10-19-google-button',
    date: '2026-10-19',
    title: 'Consistent Google sign-in button',
    summary:
      'Google sign-in now matches the other provider buttons in both themes.',
    changes: [
      'A product-rendered button replaces the visible SDK styling, with a full-width click target, keyboard focus and localized text.',
      'Google Identity Services continues to handle sign-in and credential verification.',
    ],
    image: '/changelog/google-button.png',
    imageAlt:
      'Google and Yandex sign-in controls with matching dark theme styling.',
  },
  {
    id: '2026-10-19-product-version',
    date: '2026-10-19',
    title: 'Product version in settings',
    summary:
      'See the installed product version in Settings → App, including self-hosted company installations.',
    changes: [
      'The version comes from the application package at build time and updates with each release.',
    ],
    image: '/changelog/product-version.png',
    imageAlt: 'Application preferences with the installed product version.',
  },
  {
    id: '2026-10-19-guest-links',
    date: '2026-10-19',
    title: 'Guest links without an expiration',
    summary:
      'Share a workspace until you revoke access, with clear permissions and a simpler link list.',
    changes: [
      'Choose No expiration for viewing or editing links; access lasts until the owner revokes the link.',
      'Revoked links disappear immediately and end access for every guest who used them. Other links keep working.',
      'Guest link descriptions and form typography are clearer; revoking an older link keeps the latest created link available to copy.',
    ],
    image: '/changelog/guest-links.png',
    imageAlt:
      'Guest link form showing unlimited viewing access and a separate editing link.',
  },
  {
    id: '2026-10-19-network-canvas',
    date: '2026-10-19',
    title: 'Flexible Canvas blocks and sharing',
    summary:
      'Choose a block icon, copy connected nodes, and share your workspace with separate view or edit links.',
    changes: [
      'Existing equipment nodes automatically become universal blocks with matching icons; titles, positions, connections and saved details are preserved.',
      'A universal block replaces the long equipment menu. Choose an icon and describe devices in the description or notes; description line breaks stay visible.',
      'Ctrl/Cmd+C and Ctrl/Cmd+V copy selected Canvas nodes with their internal connections; repeated pastes get new IDs and positions and support undo.',
      'Create multiple independent temporary links with View only or Can edit permissions. Viewing links cannot save changes, invite others or grant access.',
      'Clearing a title no longer inserts Untitled in Canvas, wireframe blocks, requirements or notes; empty titles can be saved and edited again.',
    ],
    image: '/changelog/network-canvas.png',
    imageAlt:
      'Example network built with universal icon blocks, multiline descriptions and the icon picker.',
  },
  {
    id: '2026-10-19-workspace-management',
    date: '2026-10-19',
    title: 'Manage your workspaces and account access',
    summary:
      'Rename a workspace or delete it as its owner, and see the account that already keeps your access.',
    changes: [
      'Workspace cards offer Rename and Delete to owners; deletion requires typing the current name and permanently removes documents, history and access.',
      'Deleted or unavailable workspaces are removed from saved open tabs; returning to an editor refreshes access and workspace names.',
      'Workspace management uses consistent form typography and translated action labels.',
      'Linked accounts no longer ask you to connect another provider; account recovery instructions match your connected Google, Yandex or SSO identity.',
    ],
    image: '/changelog/workspace-management.png',
    imageAlt:
      'Russian workspace deletion dialog with a warning and name confirmation.',
  },
  {
    id: '2026-10-19-first-workspace',
    date: '2026-10-19',
    title: 'Create your first workspace without an invitation',
    summary:
      'After signing in with Google, Yandex ID or SSO, create your own workspace or join someone else’s with an invitation.',
    changes: [
      'New accounts can create an isolated workspace immediately and become its owner; existing workspace memberships remain unchanged.',
      'The workspace list offers optional invitation entry, and invitation screens let signed-in users return to their own workspaces.',
    ],
    image: '/changelog/first-workspace.png',
    imageAlt:
      'Empty workspace list for a newly signed-in fixture account, with create and join actions.',
  },
  {
    id: '2026-10-19-yandex-compose',
    date: '2026-10-19',
    title: 'SSO and self-hosted company studios',
    summary:
      'Choose Google, Yandex ID or corporate SSO, and customize your own installation.',
    changes: [
      'Google, Yandex ID and corporate SSO are optional; the sign-in screen shows configured providers only.',
      'Accounts share one provider-aware table; existing Google identities, profiles and memberships are preserved.',
      'Customize the product name and logo through ARIL_PRODUCT_NAME and ARIL_PRODUCT_LOGO_URL in the same .env used by Docker Compose.',
      'Set ARIL_PRODUCT_SITE_ENABLED=false to hide the landing page, changelog, demo and product links.',
      'Corporate SSO uses the shared sign-in page with its example diagram; product pages, demo and promotional links remain hidden in company mode.',
      'Google sign-in follows the app theme and uses the same full-width, 48-pixel control layout as the other providers.',
      'Language switching preserves the form without flashing a disabled Google sign-in control.',
      'Failed or cancelled SSO retains the invitation link; OIDC authorization endpoint parameters are preserved.',
    ],
    image: '/changelog/sso-sign-in.png',
    imageAlt:
      'Company sign-in screen with custom product branding, fixture SSO and an example diagram.',
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
