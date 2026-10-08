import type { z } from 'zod'
import type { liveFieldsMessageSchema } from '../config/liveFieldsMessageSchema.ts'
export type LiveFieldsMessage = z.infer<typeof liveFieldsMessageSchema>
