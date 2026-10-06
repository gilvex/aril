import type { RequirementField } from './requirementField.ts'
export type RequirementPresence = {
  id: string
  field: RequirementField | null
  typing: boolean
}
