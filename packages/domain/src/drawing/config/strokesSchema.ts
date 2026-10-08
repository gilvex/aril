import { z } from 'zod'

export const strokesSchema = z
  .record(
    z
      .string()
      .min(1)
      .max(100)
      .refine((id) => !['__proto__', 'constructor', 'prototype'].includes(id)),
    z.object({
      points: z
        .array(
          z.object({
            x: z.number().finite().min(-1e6).max(1e6),
            y: z.number().finite().min(-1e6).max(1e6),
          }),
        )
        .min(2)
        .max(2000),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      width: z.number().min(1).max(24),
      opacity: z.number().min(0.1).max(1),
    }),
  )
  .refine((strokes) => Object.keys(strokes).length <= 500)
