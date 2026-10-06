import { z } from 'zod'

export const operationsSchema = z
  .array(
    z.object({
      path: z
        .array(
          z
            .string()
            .min(1)
            .max(100)
            .refine(
              (s) => !['__proto__', 'constructor', 'prototype'].includes(s),
            ),
        )
        .min(1)
        .max(8),
      before: z.json().optional(),
      after: z.json().optional(),
    }),
  )
  .max(10000)
