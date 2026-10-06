export const demoTopics = [
  {
    title: 'Readiness probe',
    anchor: 'template',
    description: 'Check the game port before marking a new server ready.',
    requirement: 'R13',
  },
  {
    title: 'Backup schedule',
    anchor: 'template',
    description: 'Snapshot each world volume before applying a server update.',
    requirement: 'R13',
  },
  {
    title: 'Metrics collector',
    anchor: 'logs',
    description: 'Keep CPU, memory, and player counts beside incident history.',
    requirement: 'R05',
  },
  {
    title: 'Log archive',
    anchor: 'logs',
    description: 'Retain installation output even after the browser closes.',
    requirement: 'R12',
  },
  {
    title: 'Release gate',
    anchor: 'game',
    description: 'Verify a game build before promoting its immutable version.',
    requirement: 'R13',
  },
  {
    title: 'Secret store',
    anchor: 'template',
    description:
      'Resolve registry credentials without baking them into images.',
    requirement: 'R04',
  },
  {
    title: 'Resource monitor',
    anchor: 'logs',
    description: 'Record resource pressure with the affected server and time.',
    requirement: 'R05',
  },
  {
    title: 'Update policy',
    anchor: 'game',
    description: 'Choose when instances adopt a new versioned game layer.',
    requirement: 'R13',
  },
  {
    title: 'Recovery plan',
    anchor: 'template',
    description:
      'Restore an instance using its blueprint and latest world snapshot.',
    requirement: 'R13',
  },
  {
    title: 'Network policy',
    anchor: 'template',
    description: 'Validate host port allocations before launching a batch.',
    requirement: 'R01',
  },
  {
    title: 'Build cache',
    anchor: 'base',
    description:
      'Reuse pinned runtime layers while building new game versions.',
    requirement: 'R13',
  },
  {
    title: 'Audit trail',
    anchor: 'logs',
    description:
      'Keep an attributable history of permission and deployment changes.',
    requirement: 'R02',
  },
] as const
