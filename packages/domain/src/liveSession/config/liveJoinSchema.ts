import { z } from 'zod'

export const liveJoinSchema = z.object({
  clientId: z.string().uuid(),
  publicKey: z.string().regex(/^[\w-]{43}$/),
})
