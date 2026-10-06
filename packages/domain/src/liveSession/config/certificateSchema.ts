import { z } from 'zod'
import { liveJoinSchema } from './liveJoinSchema.ts'
export const certificateSchema = liveJoinSchema.extend({
  workspaceId: z.string().min(1).max(100),
  expiresAt: z.number().int(),
  profile: z.object({
    id: z.string().uuid(),
    name: z.string().max(60),
    avatar: z.string().max(180000),
    color: z.string().regex(/^#[\da-fA-F]{6}$/),
  }),
})
