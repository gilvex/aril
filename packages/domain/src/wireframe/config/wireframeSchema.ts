import { z } from 'zod'
import { wireNode } from './wireNode.ts'
export const wireframeSchema = z
  .object({
    nodes: z.array(wireNode).max(500),
    edges: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          source: z.string(),
          target: z.string(),
          label: z.string().max(120),
          type: z.literal('smoothstep'),
        }),
      )
      .max(1500),
  })
  .superRefine((graph, context) => {
    const nodes = new Map(graph.nodes.map((n) => [n.id, n]))
    if (
      nodes.size !== graph.nodes.length ||
      new Set(graph.edges.map((e) => e.id)).size !== graph.edges.length
    )
      context.addIssue({ code: 'custom', message: 'Duplicate wireframe IDs' })
    for (const node of graph.nodes) {
      if (
        node.parentId &&
        (node.data.kind === 'screen' ||
          nodes.get(node.parentId)?.data.kind !== 'screen')
      )
        context.addIssue({
          code: 'custom',
          message: 'Wireframe blocks must belong to a top-level screen',
        })
    }
    if (
      graph.edges.some(
        (e) =>
          !nodes.has(e.source) || !nodes.has(e.target) || e.source === e.target,
      )
    )
      context.addIssue({
        code: 'custom',
        message: 'Flows must connect two existing wireframe blocks',
      })
  })
