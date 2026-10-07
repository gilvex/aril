import type { z } from 'zod'
import type { designPageSchema } from '../config/designPageSchema.ts'
export type DesignPage = z.infer<typeof designPageSchema>
