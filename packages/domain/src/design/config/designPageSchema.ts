import { z } from 'zod'
import { strokesSchema } from '../../drawing/index.ts'
import { designElementSchema } from './designElementSchema.ts'
import { isDesignContainer } from '../utils/isDesignContainer.ts'

export const designPageSchema = z
  .object({
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(120),
    strokes: strokesSchema.optional(),
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
      if (node.parentId && !isDesignContainer(nodes.get(node.parentId)))
        context.addIssue({
          code: 'custom',
          message: 'Design layers must belong to a frame or group',
        })
      const seen = new Set([node.id])
      let parentId = node.parentId
      while (parentId) {
        if (seen.has(parentId)) {
          context.addIssue({
            code: 'custom',
            message: 'Cyclic design hierarchy',
          })
          break
        }
        seen.add(parentId)
        parentId = nodes.get(parentId)?.parentId
      }
      if (node.maskId) {
        const mask = nodes.get(node.maskId)
        if (
          node.kind !== 'group' ||
          mask?.parentId !== node.id ||
          !['rectangle', 'ellipse'].includes(mask?.kind || '')
        )
          context.addIssue({
            code: 'custom',
            message:
              'A mask must be a rectangle or ellipse directly inside its group',
          })
      }
      if (node.clipContent && node.kind !== 'frame')
        context.addIssue({
          code: 'custom',
          message: 'Only frames can clip content',
        })
    }
  })
