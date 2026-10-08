import type { Requirement } from '@pomegranate/domain/workspace'
export type ScopeQuestionProps = {
  question: NonNullable<Requirement['questions']>[number]
  current: Requirement
  update: (patch: Partial<Requirement>) => void
}
