import type { z } from 'zod'
import type { notePresenceSchema } from '../config/notePresenceSchema.ts'
export type NotePresence = z.infer<typeof notePresenceSchema>
