import { z } from 'zod'
export const workspaceTabsSchema = z
  .array(
    z.object({
      id: z.string().min(1).max(100),
      name: z.string().max(120),
      createdAt: z.string(),
      role: z.enum(['owner', 'member', 'guest', 'viewer']),
    }),
  )
  .max(100)
