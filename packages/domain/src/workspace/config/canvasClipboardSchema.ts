import { z } from 'zod'
import { node } from './node.ts'
import { edge } from './edge.ts'
export const canvasClipboardSchema = z
  .object({
    format: z.literal('aril-canvas'),
    version: z.literal(1),
    nodes: z.array(node).min(1).max(500),
    edges: z.array(edge).max(2000),
  })
  .superRefine((value, ctx) => {
    const ids = new Set(value.nodes.map((node) => node.id))
    if (
      ids.size !== value.nodes.length ||
      value.edges.some((edge) => !ids.has(edge.source) || !ids.has(edge.target))
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid canvas clipboard graph',
      })
  })
