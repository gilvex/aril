import type { StudioOverview } from '@pomegranate/domain/studios'
import type { WorkspaceSort } from '../types/workspaceSort.ts'

export function sortWorkspaces(
  studios: StudioOverview[],
  search: string,
  sort: WorkspaceSort,
  visits: Record<string, number>,
  locale: string,
) {
  const query = search.trim().toLocaleLowerCase(locale)
  return studios
    .filter((studio) => studio.name.toLocaleLowerCase(locale).includes(query))
    .sort(
      (a, b) =>
        (sort === 'recent' ? (visits[b.id] || 0) - (visits[a.id] || 0) : 0) ||
        a.name.localeCompare(b.name, locale) ||
        a.id.localeCompare(b.id),
    )
}
