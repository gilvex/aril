import type { z } from 'zod'
import type { strokesSchema } from '../config/strokesSchema.ts'
export type CanvasStrokes = z.infer<typeof strokesSchema>
