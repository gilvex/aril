import type { Requirement } from '@aril/domain/workspace'
export type ScopeQuestionProps = {
  question: NonNullable<Requirement['questions']>[number]
  current: Requirement
  update: (patch: Partial<Requirement>) => void
}
