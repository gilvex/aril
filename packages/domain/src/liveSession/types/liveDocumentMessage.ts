import type { z } from 'zod'
import type { liveDocumentMessageSchema } from '../config/liveDocumentMessageSchema.ts'
export type LiveDocumentMessage = z.infer<typeof liveDocumentMessageSchema>
