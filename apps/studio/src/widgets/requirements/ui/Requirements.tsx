import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementsProps } from '../types/requirementsProps.ts'
import { useRequirementsController } from '../model/useRequirementsController.tsx'
import { RequirementsToolbar } from './RequirementsToolbar.tsx'
import { RequirementsBulkActions } from './RequirementsBulkActions.tsx'
import { RequirementsTable } from './RequirementsTable.tsx'
import { RequirementsBoard } from './RequirementsBoard.tsx'
import { RequirementEditor } from './RequirementEditor.tsx'
import './requirements.css'
import './compactRequirements.css'
export function Requirements(props: RequirementsProps) {
  const { t } = useTranslation()
  const model = useRequirementsController(props)
  return (
    <section className="requirements-page">
      <RequirementsToolbar model={model} />
      <div
        className={
          'requirements-workspace ' + (model.current ? 'has-detail' : '')
        }
      >
        <div className="requirements-content">
          <div className="requirements-collection">
            {model.view === 'board' ? (
              <RequirementsBoard model={model} />
            ) : model.results.length ? (
              <RequirementsTable model={model} />
            ) : (
              <div className="empty-message">
                <h3>{t('No matching requirements')}</h3>
                <button className="button" onClick={model.clearFilters}>
                  {t('Clear filters')}
                </button>
              </div>
            )}
          </div>
          {model.checkedIds.length > 0 && (
            <div className="requirements-bulk-slot">
              <RequirementsBulkActions model={model} />
            </div>
          )}
        </div>
        {model.current && (
          <RequirementEditor
            model={model}
            change={props.change}
            openBoard={props.openBoard}
          />
        )}
      </div>
    </section>
  )
}
