import type { z } from 'zod'
import type { designElementSchema } from '../config/designElementSchema.ts'
export type DesignElement = z.infer<typeof designElementSchema>
