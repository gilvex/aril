import type { RequirementPresence } from '@pomegranate/domain/collaboration'
import type { Requirement } from '@pomegranate/domain/workspace'
export type RequirementsState = {
  query: string
  category: string
  activity: RequirementPresence | null
  view: 'list' | 'board'
  groupBy: 'status' | 'priority'
  priority: Requirement['priority'] | ''
  status: Requirement['status'] | ''
  checkedIds: string[]
  detailWidth: number
  draggingId: string | null
  dropGroup: string | null
}
