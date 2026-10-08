import { z } from 'zod'
import { designPageSchema } from '../../design/config/designPageSchema.ts'
import { validateDesignLibrary } from '../utils/validateDesignLibrary.ts'
const id = z
  .string()
  .min(1)
  .max(100)
  .refine((value) => !['__proto__', 'constructor', 'prototype'].includes(value))
const value = z.union([z.string().max(12000), z.number().finite(), z.boolean()])
const action = z.object({ variableId: id, value })
const component = z.object({
  id,
  name: z.string().min(1).max(120),
  variants: z
    .record(id, designPageSchema)
    .refine((v) => Object.keys(v).length > 0 && Object.keys(v).length <= 30),
})
const variable = z.object({
  id,
  name: z.string().min(1).max(120),
  collectionId: id,
  type: z.enum(['color', 'number', 'string', 'boolean']),
  values: z.record(z.string().min(1).max(80), value),
})
const collection = z.object({
  id,
  name: z.string().min(1).max(120),
  modes: z
    .array(z.string().min(1).max(80))
    .min(1)
    .max(10)
    .refine((v) => new Set(v).size === v.length),
})
const machine = z.object({
  id,
  name: z.string().min(1).max(120),
  componentId: id.optional(),
  initial: id,
  states: z
    .record(
      id,
      z.object({
        id,
        name: z.string().min(1).max(120),
        x: z.number().finite().min(-1e6).max(1e6),
        y: z.number().finite().min(-1e6).max(1e6),
        variantId: id.optional(),
        entry: z.array(action).max(30),
      }),
    )
    .refine((v) => Object.keys(v).length > 0 && Object.keys(v).length <= 100),
  transitions: z
    .record(
      id,
      z.object({
        id,
        from: id,
        to: id,
        event: z.string().min(1).max(80),
        guard: z
          .object({
            variableId: id,
            operator: z.enum(['eq', 'ne', 'gt', 'lt']),
            value,
          })
          .optional(),
        actions: z.array(action).max(30),
      }),
    )
    .refine((v) => Object.keys(v).length <= 300),
})
export const designLibrarySchema = z
  .object({
    components: z
      .record(id, component)
      .refine((v) => Object.keys(v).length <= 100),
    collections: z
      .record(id, collection)
      .refine((v) => Object.keys(v).length <= 30),
    variables: z
      .record(id, variable)
      .refine((v) => Object.keys(v).length <= 500),
    machines: z.record(id, machine).refine((v) => Object.keys(v).length <= 100),
  })
  .superRefine(validateDesignLibrary)
