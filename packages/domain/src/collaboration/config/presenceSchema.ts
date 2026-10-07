import { z } from 'zod'
import { cameraSchema } from './cameraSchema.ts'
import { requirementFieldSchema } from './requirementFieldSchema.ts'
export const presenceSchema = z.object({
  camera: cameraSchema.nullable().default(null),
  following: z.string().uuid().nullable().default(null),
  clientId: z.string().uuid(),
  boardId: z.string().max(100).nullable(),
  designPageId: z.string().max(100).nullable().optional(),
  view: z.enum([
    'canvas',
    'wireframes',
    'requirements',
    'design',
    'notes',
    'settings',
  ]),
  cursor: z
    .object({
      x: z.number().finite().min(-1e7).max(1e7),
      y: z.number().finite().min(-1e7).max(1e7),
    })
    .nullable(),
  selected: z.array(z.string().max(100)).max(500),
  selectedEdges: z.array(z.string().min(1).max(100)).max(1500).default([]),
  requirement: z
    .object({
      id: z.string().min(1).max(100),
      field: requirementFieldSchema.nullable(),
      typing: z.boolean(),
    })
    .nullable()
    .default(null),
  sequence: z.number().int().nonnegative().safe().optional(),
  dragging: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        position: z.object({
          x: z.number().finite().min(-1e7).max(1e7),
          y: z.number().finite().min(-1e7).max(1e7),
        }),
      }),
    )
    .max(500)
    .default([]),
})
