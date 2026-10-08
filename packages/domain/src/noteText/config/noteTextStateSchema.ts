import { z } from 'zod'
export const noteTextStateSchema = z.object({
  seed: z.string().max(50000),
  update: z
    .string()
    .max(1000000)
    .regex(/^[A-Za-z0-9_-]*$/),
})
