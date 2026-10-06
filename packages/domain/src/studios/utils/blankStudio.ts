import { workspaceSchema } from '../../workspace/index.ts'

export function blankStudio(name: string) {
  return workspaceSchema.parse({
    schemaVersion: 1,
    boards: [
      {
        id: crypto.randomUUID(),
        name: 'First ideas',
        description: `A place to plan ${name}.`,
        nodes: [],
        edges: [],
      },
    ],
    requirements: [],
    notes: '',
    design: { accent: '#b34568', density: 'Comfortable', direction: '' },
  })
}
