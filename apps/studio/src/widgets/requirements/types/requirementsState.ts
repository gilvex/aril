import type { RequirementPresence } from '@pomegranate/domain/collaboration'

export type RequirementsState = {
  query: string
  category: string
  activity: RequirementPresence | null
}
