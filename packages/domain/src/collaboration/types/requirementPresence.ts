import type { RequirementField } from './requirementField.ts'
import type { RequirementDisclosure } from './requirementDisclosure.ts'
export type RequirementPresence = {
  properties?: RequirementDisclosure
  id: string
  field: RequirementField | null
  typing: boolean
}
