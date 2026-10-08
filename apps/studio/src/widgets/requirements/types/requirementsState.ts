import type {
  RequirementDisclosure,
  RequirementPresence,
} from '@pomegranate/domain/collaboration'
import type { Requirement } from '@pomegranate/domain/workspace'
export type RequirementsState = {
  properties: Record<string, RequirementDisclosure>
  boardFilter: string
  scopeFilter: 'all' | 'decision' | 'unlinked'
  panel: 'filters' | 'search' | null
  menuId: string | null
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
