import { z } from 'zod'

export const notePresenceSchema = z.object({
  id: z.string().min(1).max(90),
  surface: z.enum(['edit', 'read']),
  bodyKey: z.string().max(40),
  selection: z
    .object({
      start: z.number().int().min(0).max(100000),
      end: z.number().int().min(0).max(100000),
      quote: z.string().max(2000),
    })
    .refine(({ start, end }) => end >= start)
    .nullable(),
  pointer: z
    .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
    .nullable(),
})
