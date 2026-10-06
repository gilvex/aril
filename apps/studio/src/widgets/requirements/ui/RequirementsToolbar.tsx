import { Columns3, List, Plus } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
import { useRequirementsToolbar } from '../model/useRequirementsToolbar.ts'
import { RequirementsCommands } from './RequirementsCommands.tsx'
import { RequirementFilterChips } from './RequirementFilterChips.tsx'
export function RequirementsToolbar({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  const controls = useRequirementsToolbar({ model })
  const value = model.view === 'list' ? 'list' : model.groupBy
  return (
    <header className="requirements-topbar">
      <h1 className="visually-hidden">{t('Requirements')}</h1>
      <div className="requirements-view-picker">
        {model.view === 'list' ? <List size={16} /> : <Columns3 size={16} />}
        <select
          aria-label={t('Requirements view')}
          value={value}
          onChange={controls.changeView}
        >
          <option value="list">{t('List')}</option>
          <option value="status">{t('Status board')}</option>
          <option value="priority">{t('Priority board')}</option>
        </select>
        <span
          className="requirements-view-count"
          role="status"
          aria-label={t('{{shown}} of {{total}} requirements', {
            shown: model.results.length,
            total: model.workspace.requirements.length,
          })}
        >
          {model.results.length === model.workspace.requirements.length
            ? model.results.length
            : model.results.length +
              ' / ' +
              model.workspace.requirements.length}
        </span>
      </div>
      <RequirementFilterChips model={model} />
      <div className="requirements-command-group" ref={controls.root}>
        <RequirementsCommands model={model} controls={controls} />
        <button
          className="button primary req-add"
          aria-label={t('Add requirement')}
          onClick={controls.addRequirement}
        >
          <Plus size={16} />
          {t('Add')}
        </button>
      </div>
    </header>
  )
}
