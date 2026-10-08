import type { RequirementsState } from '../types/requirementsState.ts'
import { readRequirementsPreference } from '../utils/readRequirementsPreference.ts'
export function createRequirementsState(preferenceKey = ''): RequirementsState {
  return {
    boardFilter: '',
    scopeFilter: 'all',
    panel: null,
    menuId: null,
    query: '',
    category: 'All areas',
    activity: null,
    priority: '',
    status: '',
    view: 'list',
    groupBy: 'status',
    checkedIds: [],
    detailWidth: 560,
    draggingId: null,
    dropGroup: null,
    ...readRequirementsPreference(preferenceKey),
  }
}
