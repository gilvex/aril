import { z } from 'zod'

export const nodeKinds = [
  'layer',
  'service',
  'database',
  'instance',
  'person',
  'note',
] as const
export const statuses = ['Exploring', 'Decided', 'Question'] as const
const position = z.object({ x: z.number().finite(), y: z.number().finite() })
const node = z.object({
  id: z.string().min(1).max(100),
  type: z.literal('idea'),
  position,
  data: z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(2000),
    kind: z.enum(nodeKinds),
    status: z.enum(statuses),
    notes: z.string().max(12000),
    requirements: z.array(z.string()).max(50),
  }),
})
const edge = z.object({
  id: z.string().min(1).max(100),
  source: z.string(),
  target: z.string(),
  label: z.string().max(120).optional(),
  type: z.literal('smoothstep').default('smoothstep'),
})
export const requirementSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(160),
  description: z.string().max(5000),
  category: z.enum(['Deployment', 'Access', 'Operations', 'Experience']),
  priority: z.enum(['Must have', 'Should have', 'Later']),
  status: z.enum(['Captured', 'Designing', 'Ready']),
  acceptance: z.string().max(5000),
})
export const workspaceSchema = z
  .object({
    schemaVersion: z.literal(1),
    boards: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            name: z.string().min(1).max(100),
            description: z.string().max(1000),
            nodes: z.array(node).max(500),
            edges: z.array(edge).max(1500),
            viewport: z
              .object({
                x: z.number().finite(),
                y: z.number().finite(),
                zoom: z.number().min(0.1).max(3),
              })
              .optional(),
          })
          .superRefine((board, context) => {
            const ids = new Set(board.nodes.map((n) => n.id))
            if (ids.size !== board.nodes.length)
              context.addIssue({
                code: 'custom',
                message: 'Duplicate node IDs',
              })
            if (
              new Set(board.edges.map((e) => e.id)).size !== board.edges.length
            )
              context.addIssue({
                code: 'custom',
                message: 'Duplicate edge IDs',
              })
            if (
              board.edges.some((e) => !ids.has(e.source) || !ids.has(e.target))
            )
              context.addIssue({
                code: 'custom',
                message: 'Connections must reference existing nodes',
              })
          }),
      )
      .min(1)
      .max(50),
    requirements: z.array(requirementSchema).max(500),
    notes: z.string().max(50000),
    design: z.object({
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      density: z.enum(['Comfortable', 'Compact']),
      direction: z.string().max(12000),
    }),
  })
  .superRefine((workspace, context) => {
    if (
      new Set(workspace.boards.map((b) => b.id)).size !==
      workspace.boards.length
    )
      context.addIssue({ code: 'custom', message: 'Duplicate board IDs' })
    const requirements = new Set(workspace.requirements.map((r) => r.id))
    if (requirements.size !== workspace.requirements.length)
      context.addIssue({ code: 'custom', message: 'Duplicate requirement IDs' })
    if (
      workspace.boards.some((b) =>
        b.nodes.some((n) =>
          n.data.requirements.some((id) => !requirements.has(id)),
        ),
      )
    )
      context.addIssue({
        code: 'custom',
        message: 'Unknown linked requirement',
      })
  })
export type Workspace = z.infer<typeof workspaceSchema>
export type Board = Workspace['boards'][number]
export type Idea = Board['nodes'][number]
export type Requirement = Workspace['requirements'][number]
export type Envelope = {
  workspace: Workspace
  revision: number
  savedAt: string
}
