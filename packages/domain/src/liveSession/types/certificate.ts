import { z } from 'zod'
import { certificateSchema } from '../config/certificateSchema.ts'
export type Certificate = z.infer<typeof certificateSchema>
