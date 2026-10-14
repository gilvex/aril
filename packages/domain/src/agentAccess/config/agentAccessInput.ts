import { z } from 'zod'

export const agentAccessInput = z.object({
  target: z.enum(['account', 'workspace']).default('workspace'),
  name: z.string().trim().min(1).max(60),
  scope: z.enum(['read', 'write']),
  days: z.union([z.literal(7), z.literal(30), z.literal(90)]),
})
