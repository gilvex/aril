import { z } from 'zod'
import { wireframeSchema } from '../../wireframe/index.ts'
import { edge } from './edge.ts'
import { node } from './node.ts'
import { requirementSchema } from './requirementSchema.ts'
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
            wireframe: wireframeSchema.optional(),
            wireframeViewport: z
              .object({
                x: z.number().finite(),
                y: z.number().finite(),
                zoom: z.number().min(0.1).max(3),
              })
              .optional(),
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
