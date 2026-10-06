import { z } from 'zod'

export const edge = z.object({
  id: z.string().min(1).max(100),
  source: z.string(),
  target: z.string(),
  label: z.string().max(120).optional(),
  type: z.literal('smoothstep').default('smoothstep'),
})
