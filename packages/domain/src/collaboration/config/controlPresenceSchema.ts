import { z } from 'zod'
export const controlPresenceSchema = z.object({
  route: z.string().max(400),
  pointer: z
    .object({
      scope: z.string().max(500),
      target: z.string().max(800),
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
    })
    .nullable(),
  focus: z
    .object({
      scope: z.string().max(500),
      target: z.string().max(800),
      selection: z
        .object({
          start: z.number().int().min(0).max(100000),
          end: z.number().int().min(0).max(100000),
          fingerprint: z.string().max(40),
        })
        .nullable(),
    })
    .nullable(),
})
