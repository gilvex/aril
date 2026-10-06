import { z } from 'zod'
import { wireKinds } from './wireKinds.ts'
export const wireNode = z.object({
  id: z.string().min(1).max(100),
  type: z.literal('wireframe'),
  position: z.object({ x: z.number().finite(), y: z.number().finite() }),
  width: z.number().min(60).max(2400),
  height: z.number().min(32).max(2400),
  parentId: z.string().min(1).max(100).optional(),
  data: z.object({
    kind: z.enum(wireKinds),
    title: z.string().min(1).max(120),
    content: z.string().max(2000),
    tone: z.enum(['plain', 'soft', 'accent']),
  }),
})
