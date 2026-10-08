import type { z } from 'zod'
import type { controlPresenceSchema } from '../config/controlPresenceSchema.ts'
export type ControlPresence = z.infer<typeof controlPresenceSchema>
