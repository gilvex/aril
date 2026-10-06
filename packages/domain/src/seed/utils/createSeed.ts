import type { Workspace } from '../../workspace/index.ts'
import { boards } from '../config/boards.ts'
import { req } from './req.ts'
export function createSeed(): Workspace {
  return structuredClone({
    schemaVersion: 1,
    boards,
    requirements: [
      req(
        'R01',
        'Batch operations with per-item results',
        'Create multiple containers from the same configuration and grant a user access to several services in one operation.',
        'Deployment',
        'Select multiple targets, review the action, receive per-item success/failure results, and retry failed items without duplicating successful ones.',
      ),
      req(
        'R02',
        'Session control & sign-in history',
        'See who signed in, when, and from where. Revoke sessions without manually editing Redis or the panel database.',
        'Access',
        'List active sessions and sign-in events; revoke one or all sessions. Define password-reset revocation behavior. Prefer individual identities over shared accounts.',
      ),
      req(
        'R03',
        'Projects, folders & saved views',
        'Make a large fleet navigable through meaningful groups, tags, search, sorting, and filters.',
        'Experience',
        'Users can find a service by project, environment, name, status, or tag, and save a useful view.',
      ),
      req(
        'R04',
        'Registry credentials & mounts in the UI',
        'Configure image registry access and allowed volume mounts through an authorized workflow, without hand-editing node configuration.',
        'Operations',
        'Store credentials as secret references, verify image access, validate allowed host paths, and show mount errors before launch.',
      ),
      req(
        'R05',
        'Useful, role-aware diagnostics',
        'Show administrators actionable errors and separate workload events from noisy SFTP authentication traffic.',
        'Operations',
        'Provide event IDs, severity/source filters, relevant context, and redacted diagnostics based on the viewer’s role.',
      ),
      req(
        'R06',
        'Pluggable database providers',
        'Support database engines beyond MySQL through a clear provider capability model.',
        'Operations',
        'Define create/delete/credential rotation and backup capabilities; choose initial engines explicitly.',
      ),
      req(
        'R07',
        'Granular administration permissions',
        'Replace all-or-nothing administration with scoped roles and resource permissions.',
        'Access',
        'Authorize actions at workspace/project/service scope. Show effective access and deny unauthorized API operations.',
      ),
      req(
        'R08',
        'A file manager that handles large folders',
        'Browse directories with thousands of files without silent truncation or requiring SFTP.',
        'Experience',
        'Paginate or virtualize large listings, display total/loaded counts, and support search without hiding entries.',
      ),
      req(
        'R09',
        'User-centric access inventory',
        'Inspect every service a user can access and why access was granted.',
        'Access',
        'An authorized operator can view effective access, its role/group source, and revoke it in a batch.',
      ),
      req(
        'R10',
        'Documented, versioned API',
        'Make automation a first-class way to operate Pomegranate.',
        'Deployment',
        'Publish an OpenAPI contract with authentication, permissions, examples, errors, pagination, and versioning policy.',
      ),
      req(
        'R11',
        'Editable startup configuration',
        'Allow authorized users to change a service’s startup command and validated environment parameters.',
        'Deployment',
        'Preview the effective command, validate inputs, record the change, and clearly explain when restart is required.',
      ),
      req(
        'R12',
        'Retained build, runtime & incident logs',
        'Install logs and crash history must exist even when no browser is connected.',
        'Operations',
        'Reopen a failed installation or crash later and see ordered events with timestamps. Define retention, storage limits, and redaction.',
      ),
      req(
        'R13',
        'Reusable game layers & instance parameters',
        'Build game binaries once, add a reusable server configuration, then launch many isolated instances using environment values such as GAME_PORT.',
        'Deployment',
        'Version immutable artifacts and blueprints; allocate host ports; isolate writable data; inject per-instance configuration and secret references.',
      ),
      req(
        'R14',
        'Self-hosted and SaaS editions',
        'Ship an open-source self-hosted platform and offer a managed SaaS experience with a coherent core model.',
        'Deployment',
        'Document edition boundaries, upgrade/backup paths, and tenant isolation. Decide license and hosted billing separately.',
      ),
      req(
        'R15',
        'Declarative infrastructure workflow',
        'Represent desired infrastructure as a portable declaration that can be reviewed before application.',
        'Deployment',
        'Design plan/diff/apply, state reconciliation, drift reporting, and idempotency. Choose Terraform/OpenTofu or another integration after evaluation.',
      ),
    ],
    notes:
      '# Pomegranate\n\nA comfy deployment platform: open-source and self-hostable, with a managed SaaS offering.\n\n## Product principles\n- Reuse the work, not the writable state.\n- Batch actions should feel safe and predictable.\n- An incident should leave a useful history, even when nobody is watching.\n- Permissions should explain both what you can do and why.\n\n## References\nPterodactyl Panel and the user’s reference to Yandex deployment tooling (Arcanum / Deploy). The exact Yandex product/reference needs clarification. Pterodactyl pain points are user-reported experience, not a verified current-version audit.\n\n## Open decisions\n- Which games and deployment target should the first end-to-end flow support?\n- Which database engines are essential on day one?\n- How should the SaaS control plane connect to customer-owned nodes?\n- What is the boundary between the open-source and hosted editions?\n- Which UI language should the product ship first?\n\n## First milestone\nOne versioned game blueprint, two isolated instances, validated ports, scoped access, and retained installation logs.\n',
    design: {
      accent: '#b34568',
      density: 'Comfortable',
      direction:
        'A calm operations workspace with a strong information hierarchy. Quiet surfaces, legible data, a restrained berry accent, and clear feedback. Expressive details should make the system easier to understand. Reference Juxtopposed’s deliberate use of color and component-level exploration without copying a particular redesign.',
    },
  })
}
