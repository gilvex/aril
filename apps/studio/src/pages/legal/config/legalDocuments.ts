import type { LegalDocument } from '../types/legalDocument.ts'

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'terms',
    title: 'Terms of service',
    summary: 'The free hosted service, your content, and our responsibilities.',
    sections: [
      {
        id: 'operator',
        title: 'Who provides the service',
        paragraphs: [
          'These proposed terms cover www.aril.studio, operated by Ali Aliyev, an individual based in Azerbaijan. Contact: skaneprime@gmail.com. GilGil is a planned name, not a registered operator. These terms do not govern independently hosted installations.',
          'This is a review draft, not an effective agreement. Signing in does not record acceptance of these draft terms. An effective version and any required acceptance process must be announced before activation.',
        ],
      },
      {
        id: 'service',
        title: 'Free service and eligibility',
        paragraphs: [
          'Aril is a collaborative planning and design studio, not a deployment executor. The hosted service is free, with no paid subscription or payment collection. Future paid offerings would require separate prices and terms.',
          'The proposed policy is for adults aged 18 or over who can enter an agreement. If acting for an organization, you must be authorized to do so. These eligibility conditions are for operator review before activation.',
        ],
      },
      {
        id: 'access',
        title: 'Accounts, guests and agents',
        paragraphs: [
          'Keep credentials secure and invite only authorized collaborators. Workspace owners manage membership and editor/viewer roles. Anyone receiving a valid guest link may access the linked workspace until expiry or revocation. Removing access does not recall copies already received.',
          'Connecting an MCP client is your choice. Account credentials can reach current and future workspaces accessible to your account, subject to their permissions. Review automated edits and revoke unused credentials. External AI clients have their own terms and data practices.',
        ],
      },
      {
        id: 'content',
        title: 'Your content stays yours',
        paragraphs: [
          'You retain your rights in workspace content. You grant only permission to host, store, process, transmit and display it to provide the service and your requested collaboration. This does not make private content open source or grant permission to sell it or train AI models on it.',
          'Share only content you have the right to share. Do not upload passwords, access keys, sensitive regulated records or special-category personal data. You are responsible for permissions needed to share other people’s information.',
        ],
      },
      {
        id: 'acceptable-use',
        title: 'Acceptable use and reports',
        paragraphs: [
          'Do not use Aril for unlawful content, infringement, harassment, malware, spam or credential theft. Do not bypass access controls, disrupt the service or probe other people’s workspaces. Report security concerns privately without accessing or exposing another person’s data.',
          'For abuse or copyright reports, identify the affected content, explain the issue and your authority to report it, and provide contact details. Do not post private material in a public issue. The operator may restrict access for credible security, legal or abuse concerns, with an explanation and opportunity to contest the decision where lawful and practicable.',
        ],
      },
      {
        id: 'leaving',
        title: 'Availability and leaving',
        paragraphs: [
          'The free service has no uptime or recovery guarantee. Features can change and outages or data loss may occur. Keep exports and backups of important work; bounded history is not a backup service. Nothing here excludes rights or duties that cannot lawfully be excluded.',
          'You may stop using Aril at any time. Export work, revoke agent credentials and contact the operator for account or data deletion. Signing out does not delete your account. For planned shutdowns, the operator intends to provide reasonable notice and an export opportunity where practicable; urgent legal or security action may require immediate restrictions.',
        ],
      },
      {
        id: 'law',
        title: 'Changes and applicable law',
        paragraphs: [
          'The proposed governing law is Azerbaijan’s law, preserving mandatory protections available under applicable law. These terms impose no mandatory arbitration or waiver of access to a competent court. Contact the operator to try to resolve concerns.',
          'Material changes should be notified before taking effect, with fresh agreement where required. A revised date alone does not prove acceptance. The Apache-2.0 software license is independent of these hosted-service terms.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy notice',
    summary:
      'What is processed, who can see it, and how to exercise your rights.',
    sections: [
      {
        id: 'scope',
        title: 'Operator and scope',
        paragraphs: [
          'Ali Aliyev in Azerbaijan operates www.aril.studio and receives privacy requests at skaneprime@gmail.com. Independent hosts must provide their own privacy notices and contacts. This draft describes the audited application and proposed practices; it is not a regulatory-compliance claim or blanket consent.',
        ],
      },
      {
        id: 'data',
        title: 'Data used by Aril',
        paragraphs: [
          'Account data includes your name, avatar, profile identifier and, for Google sign-in, a Google identifier and verified email. Aril does not receive your Google password. Guests provide a display name. Sessions, memberships, roles, invitations, guest links and agent credential records support access control.',
          'Workspace data includes boards, designs, components, variables, notes, decisions, comments and activity/history. Live collaboration exchanges cursor positions, selections, view/follow state, field activity and short-lived cursor messages. Providers may process IP addresses, request times, browser/device information and technical logs when serving requests.',
        ],
      },
      {
        id: 'purposes',
        title: 'Purposes and external agents',
        paragraphs: [
          'Data supports authentication, permissions, saving and recovery, live collaboration, requested integrations, troubleshooting, abuse prevention and support or legal requests. The application currently includes no payment collection, advertising tracker or analytics SDK.',
          'Aril has no built-in AI chat or model-training pipeline. An external MCP or AI client receives data you authorize it to access and may send it to its own providers. Their retention and training policies are separate.',
        ],
      },
      {
        id: 'sharing',
        title: 'Who can see your data',
        paragraphs: [
          'Workspace collaborators see content and activity within their access, including names, avatars and presence. Email is not included in shared presence. Owners manage access; valid guest links can admit their recipients.',
          'Vercel hosts the application, Supabase provides hosted Postgres and realtime transport, and Google provides sign-in. Authorized operator access may be necessary for support, security or legal requests. Disclosures required by law are assessed under applicable law.',
        ],
        links: [
          {
            label: 'Service providers',
            href: '/legal/providers',
          },
        ],
      },
      {
        id: 'retention',
        title: 'Storage and retention',
        paragraphs: [
          'Account and workspace records remain on the server while retained for the service; closing a tab or signing out does not erase them. Workspace history is bounded. Expired credentials stop granting access, but expiry does not prove that records or backups have been deleted.',
          'Presence and cursor messages are transient, not stored as document history by the application. Notes, saved comments and document edits are durable. Browser recovery drafts and preferences may survive logout. A complete schedule for account deletion, provider logs and backups is not yet verified; no fixed deletion time is promised in this draft.',
        ],
      },
      {
        id: 'basis',
        title: 'Legal basis and international processing',
        paragraphs: [
          'Before activation, the operator must confirm the lawful basis and consent procedure for each purpose, any registration requirements, and the deletion schedule. Where required, consent must be obtained separately in the legally required form. Viewing this page or signing in is not a substitute.',
          'International providers may process personal data outside Azerbaijan. Exact hosting, database, backup and support-access locations and transfer safeguards must be verified before this notice takes effect. A provider-policy link does not establish a lawful transfer.',
        ],
      },
      {
        id: 'rights',
        title: 'Requests and choices',
        paragraphs: [
          'Email the operator to request information, access, correction, deletion, restriction or withdrawal of consent where processing relies on it. Portability and objection rights may also apply under applicable law. You may complain to the competent supervisory authority or a court.',
          'Proportionate identity verification may be needed, while protecting other people’s data and applicable legal duties. There is no self-service account deletion yet. Workspace JSON export is available, but does not export every account or provider record. Never email passwords or agent credentials.',
        ],
      },
      {
        id: 'security',
        title: 'Security, children and updates',
        paragraphs: [
          'The application checks membership and roles, uses HTTPS on the hosted site and stores hashes of session and agent secrets on the server. No system guarantees absolute security. Report suspected breaches privately. The proposed service is for adults; contact the operator if a child has supplied data.',
          'Material privacy changes should be communicated before new processing begins, with fresh consent where required. Do not upload sensitive regulated records or secrets.',
        ],
      },
    ],
  },
  {
    slug: 'storage',
    title: 'Cookies & storage',
    summary:
      'Sign-in sessions, device preferences and recoverable browser drafts.',
    sections: [
      {
        id: 'sessions',
        title: 'Sign-in storage',
        paragraphs: [
          'Aril uses the first-party pomegranate_session cookie for authentication: HttpOnly, SameSite=Strict, Secure on HTTPS, and a 30-day maximum age when issued. A session token is also stored under pomegranate-studio-session in localStorage. LocalStorage has no automatic expiry; the server decides whether an expired or revoked token works. These legacy names remain for compatibility.',
        ],
      },
      {
        id: 'drafts',
        title: 'Preferences and recovery drafts',
        paragraphs: [
          'LocalStorage remembers language, theme, accent, panel layout and visited workspaces until overwritten or cleared. SessionStorage holds tab state, demo content and some recovery drafts. Browsers may restore this data when restoring tabs; older recovery data can also remain in localStorage.',
          'Signing out revokes browser credentials but preserves recoverable drafts. Save or export work before clearing site data. On shared devices, clear site data when finished; logout alone does not erase every local copy.',
        ],
      },
      {
        id: 'cache',
        title: 'Offline screen and cache',
        paragraphs: [
          'The service worker caches only the public reconnect screen, its script and logos, not workspace API responses or offline editing data. Normal browser caching may also retain static scripts, images and fonts. DM Sans and Manrope fonts are served with the application.',
        ],
      },
      {
        id: 'third-parties',
        title: 'Third-party requests',
        paragraphs: [
          'When configured Google sign-in is displayed, its Identity script loads before you click the button. Google may receive request/device information and use its own storage. Images from Google or external URLs inserted by collaborators also contact their hosts.',
        ],
        links: [
          {
            label: 'Google privacy policy',
            href: 'https://policies.google.com/privacy',
          },
        ],
      },
      {
        id: 'controls',
        title: 'Your controls',
        paragraphs: [
          'Use browser site settings to inspect, block or remove cookies and local data. Blocking authentication storage can prevent sign-in; clearing drafts can lose unsaved work. The audited application has no advertising or analytics SDK. This disclosure is not a consent banner: any future non-exempt tracking needs an appropriate choice before it starts.',
        ],
      },
    ],
  },
  {
    slug: 'providers',
    title: 'Service providers',
    summary: 'Hosting, sign-in, integrations and software notices.',
    sections: [
      {
        id: 'hosting',
        title: 'Hosting and collaboration',
        paragraphs: [
          'Vercel serves the site and API. Supabase provides hosted Postgres storage and realtime transport. They may process workspace data, identifiers and technical requests to provide these services. Exact regions, backup retention and applicable contractual arrangements remain operator verification items.',
        ],
        links: [
          {
            label: 'Vercel privacy notice',
            href: 'https://vercel.com/legal/privacy-notice',
          },
          {
            label: 'Vercel data processing addendum',
            href: 'https://vercel.com/legal/dpa',
          },
          {
            label: 'Supabase privacy policy',
            href: 'https://supabase.com/privacy',
          },
          {
            label: 'Supabase data processing addendum',
            href: 'https://supabase.com/legal/customer-resources/data-processing-addendum',
          },
        ],
      },
      {
        id: 'identity',
        title: 'Google and external clients',
        paragraphs: [
          'Google provides account sign-in; guest access does not require a Google account. Your chosen MCP client or AI provider is not automatically an Aril service provider. Review its data practices before granting access. Messages sent to the public Gmail contact are processed by Google’s email service.',
        ],
        links: [
          {
            label: 'Google privacy policy',
            href: 'https://policies.google.com/privacy',
          },
        ],
      },
      {
        id: 'software',
        title: 'Open-source software and attribution',
        paragraphs: [
          'Aril’s original code is under Apache-2.0, allowing use, modification and redistribution subject to that license, including its patent, attribution and warranty provisions. It does not grant rights to private user content or imply endorsement of forks.',
          'Dependencies, fonts, icons and installed third-party skills retain their own licenses. Preserve notices applicable to what you redistribute. The repository includes a generated dependency inventory and upstream license texts, not a warranty that every distribution is compliant.',
        ],
        links: [
          {
            label: 'Aril source and license',
            href: 'https://github.com/gilvex/aril',
          },
          {
            label: 'Third-party notices',
            href: '/third-party-notices.txt',
          },
        ],
      },
    ],
  },
]
