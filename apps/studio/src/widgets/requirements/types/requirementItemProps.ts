import type { Requirement } from '@aril/domain/workspace'
import type { RequirementsViewProps } from './requirementsViewProps.ts'
export type RequirementItemProps = RequirementsViewProps & { item: Requirement }
