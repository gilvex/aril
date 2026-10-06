import { z } from 'zod'

export const cameraSchema = z.object({
  x: z.number().finite().min(-1e7).max(1e7),
  y: z.number().finite().min(-1e7).max(1e7),
  zoom: z.number().finite().min(0.1).max(2),
})
