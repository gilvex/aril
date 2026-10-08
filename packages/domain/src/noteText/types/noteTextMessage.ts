import type { z } from 'zod'
import type { noteTextMessageSchema } from '../config/noteTextMessageSchema.ts'
export type NoteTextMessage = z.infer<typeof noteTextMessageSchema>
