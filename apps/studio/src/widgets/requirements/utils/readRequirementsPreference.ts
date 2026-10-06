import type { RequirementsState } from '../types/requirementsState.ts'
export function readRequirementsPreference(
  key: string,
): Partial<RequirementsState> {
  try {
    if (!key || typeof localStorage === 'undefined') return {}
    const saved = JSON.parse(localStorage.getItem(key) || '{}')
    return {
      view: saved.view === 'board' ? 'board' : 'list',
      groupBy: saved.groupBy === 'priority' ? 'priority' : 'status',
      detailWidth:
        typeof saved.detailWidth === 'number' &&
        Number.isFinite(saved.detailWidth)
          ? Math.max(360, Math.min(850, saved.detailWidth))
          : 560,
    }
  } catch {
    return {}
  }
}
