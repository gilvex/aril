import { useScopeCollection } from '../model/useScopeCollection.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { Plus } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
import { useRequirementsToolbar } from '../model/useRequirementsToolbar.ts'
import { RequirementsCommands } from './RequirementsCommands.tsx'
import { RequirementFilterChips } from './RequirementFilterChips.tsx'
export function RequirementsToolbar({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { visibleCount } = useScopeCollection(model)
  const controls = useRequirementsToolbar({ model })
  return (
    <header className="requirements-topbar">
      <h1>{t('Scope')}</h1>
      <div className="requirements-view-picker">
        <StudioSelect
          aria-label={t('Filter scope by board')}
          value={model.boardFilter}
          onChange={(event) =>
            model.setViewState({ boardFilter: event.target.value })
          }
        >
          <option value="">{t('All boards')}</option>
          <option value="workspace">{t('Workspace-wide')}</option>
          {model.workspace.boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </StudioSelect>
        <span
          className="requirements-view-count"
          role="status"
          aria-label={t('{{shown}} of {{total}} requirements', {
            shown: visibleCount,
            total: model.workspace.requirements.length,
          })}
        >
          {visibleCount === model.workspace.requirements.length
            ? visibleCount
            : visibleCount + ' / ' + model.workspace.requirements.length}
        </span>
      </div>
      <RequirementFilterChips model={model} />
      <div className="requirements-command-group" ref={controls.root}>
        <RequirementsCommands model={model} controls={controls} />
        <button
          className="button primary req-add"
          aria-label={t('Add requirement')}
          disabled={readOnly || model.workspace.requirements.length >= 500}
          onClick={controls.addRequirement}
        >
          <Plus size={16} />
          {t('Add')}
        </button>
      </div>
    </header>
  )
}
