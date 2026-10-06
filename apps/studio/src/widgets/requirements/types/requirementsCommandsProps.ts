import type { RequirementsViewProps } from './requirementsViewProps.ts'
import type { useRequirementsToolbar } from '../model/useRequirementsToolbar.ts'
export type RequirementsCommandsProps = RequirementsViewProps & {
  controls: ReturnType<typeof useRequirementsToolbar>
}
