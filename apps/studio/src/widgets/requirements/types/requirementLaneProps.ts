import type { RequirementItemProps } from './requirementItemProps.ts'
import type { RequirementsViewProps } from './requirementsViewProps.ts'
export type RequirementLaneProps = RequirementsViewProps & {
  value: string
  items: RequirementItemProps['item'][]
}
