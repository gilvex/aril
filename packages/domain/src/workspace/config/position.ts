import { z } from 'zod'

export const position = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
})
