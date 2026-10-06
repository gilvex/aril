import { z } from 'zod'
import { cameraSchema } from '../config/cameraSchema.ts'
export type CameraPresence = z.infer<typeof cameraSchema>
