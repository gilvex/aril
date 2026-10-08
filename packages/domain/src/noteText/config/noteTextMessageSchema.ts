import { z } from 'zod'
import { noteTextStateSchema } from './noteTextStateSchema.ts'
export const noteTextMessageSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('sync'),
    id: z.string().min(1).max(90),
    seedKey: z.string().max(50).optional(),
    vector: z
      .string()
      .max(200000)
      .regex(/^[A-Za-z0-9_-]+$/)
      .optional(),
  }),
  z.object({
    kind: z.literal('snapshot'),
    id: z.string().min(1).max(90),
    state: noteTextStateSchema,
  }),
  z.object({
    kind: z.literal('delta'),
    id: z.string().min(1).max(90),
    seedKey: z.string().max(50),
    update: z
      .string()
      .max(1000000)
      .regex(/^[A-Za-z0-9_-]+$/),
  }),
])
