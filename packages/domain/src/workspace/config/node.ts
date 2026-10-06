import { z } from 'zod'
import { nodeKinds } from './nodeKinds.ts'
import { position } from './position.ts'
import { statuses } from './statuses.ts'
export const node = z.object({
  id: z.string().min(1).max(100),
  type: z.literal('idea'),
  position,
  data: z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(2000),
    kind: z.enum(nodeKinds),
    status: z.enum(statuses),
    notes: z.string().max(12000),
    requirements: z.array(z.string()).max(50),
  }),
})
