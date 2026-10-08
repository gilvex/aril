import type { Requirement } from '@pomegranate/domain/workspace'
import type { RequirementsState } from '../types/requirementsState.ts'
export function filterRequirements(
  items: Requirement[],
  filters: Pick<
    RequirementsState,
    'query' | 'category' | 'priority' | 'status'
  >,
) {
  const query = filters.query.trim().toLocaleLowerCase()
  return items.filter(
    (item) =>
      (filters.category === 'All areas' ||
        item.category === filters.category) &&
      (!filters.priority || item.priority === filters.priority) &&
      (!filters.status || item.status === filters.status) &&
      (
        item.id +
        ' ' +
        item.title +
        ' ' +
        item.description +
        ' ' +
        item.acceptance +
        ' ' +
        (item.questions || []).map((q) => q.text).join(' ')
      )
        .toLocaleLowerCase()
        .includes(query),
  )
}
