import { Columns3, List, Plus, Search } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
export function RequirementsToolbar({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  return (
    <header className="requirements-topbar">
      <h1>
        {t('Requirements')} <span>{model.workspace.requirements.length}</span>
      </h1>
      <div
        className="requirements-view-toggle"
        role="group"
        aria-label={t('Requirements view')}
      >
        <button
          aria-pressed={model.view === 'list'}
          onClick={() => model.setViewState({ view: 'list' })}
        >
          <List size={16} />
          {t('List')}
        </button>
        <button
          aria-pressed={model.view === 'board'}
          onClick={() => model.setViewState({ view: 'board' })}
        >
          <Columns3 size={16} />
          {t('Board')}
        </button>
      </div>
      <label className="requirements-search">
        <Search size={16} />
        <input
          aria-label={t('Search requirements')}
          placeholder={t('Search requirements…')}
          value={model.query}
          onChange={(event) => model.setQuery(event.target.value)}
        />
      </label>
      <button className="button primary" onClick={() => model.add()}>
        <Plus size={16} />
        {t('Add requirement')}
      </button>
    </header>
  )
}
