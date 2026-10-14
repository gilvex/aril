import type { RequirementLink } from '@aril/domain/workspace'
export type ScopeTarget = RequirementLink & {
  key: string
  label: string
  context: string
}
