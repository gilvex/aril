import { z } from 'zod'

export const requirementSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(160),
  description: z.string().max(5000),
  category: z.enum(['Deployment', 'Access', 'Operations', 'Experience']),
  priority: z.enum(['Must have', 'Should have', 'Later']),
  status: z.enum(['Captured', 'Designing', 'Ready']),
  acceptance: z.string().max(5000),
})
