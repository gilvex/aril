import type { Requirement } from '@pomegranate/domain/workspace'
export type RequirementClassificationHandlersProps = {
  update: (patch: Partial<Requirement>) => void
}
