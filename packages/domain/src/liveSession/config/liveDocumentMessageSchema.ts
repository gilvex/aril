import { z } from 'zod'
import { noteTextMessageSchema } from '../../noteText/config/noteTextMessageSchema.ts'
import { liveFieldsMessageSchema } from './liveFieldsMessageSchema.ts'
export const liveDocumentMessageSchema = z.union([
  noteTextMessageSchema,
  liveFieldsMessageSchema,
])
