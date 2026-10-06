import type { Requirement } from '@pomegranate/domain/workspace'
import type { RequirementsViewProps } from './requirementsViewProps.ts'
export type RequirementItemProps = RequirementsViewProps & { item: Requirement }
