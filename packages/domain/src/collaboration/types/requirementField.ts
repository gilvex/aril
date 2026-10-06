import { z } from 'zod'
import { requirementFieldSchema } from '../config/requirementFieldSchema.ts'
export type RequirementField = z.infer<typeof requirementFieldSchema>
