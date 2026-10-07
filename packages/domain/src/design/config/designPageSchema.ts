import { z } from 'zod'
import { designElementSchema } from './designElementSchema.ts'

export const designPageSchema = z
  .object({
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(120),
    nodes: z.array(designElementSchema).max(500),
  })
  .superRefine((page, context) => {
    const nodes = new Map(page.nodes.map((node) => [node.id, node]))
    if (nodes.size !== page.nodes.length)
      context.addIssue({
        code: 'custom',
        message: 'Duplicate design layer IDs',
      })
    for (const node of page.nodes) {
      if (
        node.parentId &&
        (node.kind === 'frame' || nodes.get(node.parentId)?.kind !== 'frame')
      )
        context.addIssue({
          code: 'custom',
          message: 'Design layers must belong to a top-level frame',
        })
    }
  })
