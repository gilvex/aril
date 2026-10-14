import type { Requirement } from '@aril/domain/workspace'
export type RequirementClassificationHandlersProps = {
  update: (patch: Partial<Requirement>) => void
}
