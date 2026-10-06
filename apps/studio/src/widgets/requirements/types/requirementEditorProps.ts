import type { RequirementsViewProps } from './requirementsViewProps.ts'
import type { RequirementsProps } from './requirementsProps.ts'
export type RequirementEditorProps = RequirementsViewProps &
  Pick<RequirementsProps, 'change' | 'openBoard'>
