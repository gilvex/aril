import { z } from 'zod'
import { operationsSchema } from '../../collaboration/config/operationsSchema.ts'
export const liveFieldsMessageSchema = z.object({
  kind: z.literal('fields'),
  id: z.string().uuid(),
  sequence: z.number().int().nonnegative().safe(),
  operations: operationsSchema.refine(
    (ops) => ops.length <= 300 && JSON.stringify(ops).length <= 200000,
  ),
})
