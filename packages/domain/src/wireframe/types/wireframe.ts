import { z } from 'zod'
import { wireframeSchema } from '../config/wireframeSchema.ts'
export type Wireframe = z.infer<typeof wireframeSchema>
