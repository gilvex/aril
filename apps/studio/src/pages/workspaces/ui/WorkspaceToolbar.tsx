import { useCallback, type ChangeEvent } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { WorkspaceToolbarProps } from '../types/workspaceToolbarProps.ts'
import type { WorkspaceSort } from '../types/workspaceSort.ts'

export function WorkspaceToolbar({
  canCreate = true,
  count,
  search,
  sort,
  onSearch,
  onSort,
  onCreate,
}: WorkspaceToolbarProps) {
  const { t } = useTranslation()
  const changeSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value),
    [onSearch],
  )
  const changeSort = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) =>
      onSort(event.target.value as WorkspaceSort),
    [onSort],
  )
  const clear = useCallback(() => onSearch(''), [onSearch])
  return (
    <div className="workspace-toolbar">
      <h1>
        {t('Workspaces')} {count !== undefined && <span>{count}</span>}
      </h1>
      <div className="workspace-search">
        <Search size={17} />
        <input
          aria-label={t('Find a workspace')}
          placeholder={t('Find a workspace')}
          value={search}
          onChange={changeSearch}
        />
        {search && (
          <button
            className="icon-button"
            aria-label={t('Clear search')}
            onClick={clear}
          >
            <X size={15} />
          </button>
        )}
      </div>
      <select
        className="workspace-sort"
        aria-label={t('Sort workspaces')}
        value={sort}
        onChange={changeSort}
      >
        <option value="recent">{t('Last opened')}</option>
        <option value="name">{t('Name')}</option>
      </select>
      {canCreate && (
        <button
          className="button primary workspace-create-desktop"
          onClick={onCreate}
        >
          <Plus size={16} />
          {t('New workspace')}
        </button>
      )}
    </div>
  )
}
