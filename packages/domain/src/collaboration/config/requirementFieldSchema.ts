import { z } from 'zod'

export const requirementFieldSchema = z.enum([
  'title',
  'description',
  'acceptance',
  'priority',
  'status',
  'category',
])
