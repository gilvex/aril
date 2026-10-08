import type { RequirementLink } from '@pomegranate/domain/workspace'
export type ScopeTarget = RequirementLink & {
  key: string
  label: string
  context: string
}
