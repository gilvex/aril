import type { RequirementsProps } from '../types/requirementsProps.ts'
import { useRequirementsController } from '../model/useRequirementsController.tsx'
import { RequirementsToolbar } from './RequirementsToolbar.tsx'
import { RequirementsBulkActions } from './RequirementsBulkActions.tsx'
import { ScopeCollection } from './ScopeCollection.tsx'
import { RequirementEditor } from './RequirementEditor.tsx'
import './requirements.css'
import './compactRequirements.css'
import './scope.css'
export function Requirements(props: RequirementsProps) {
  const model = useRequirementsController(props)
  return (
    <section className="requirements-page scope-page">
      <RequirementsToolbar model={model} />
      <div
        className={
          'requirements-workspace ' + (model.current ? 'has-detail' : '')
        }
      >
        <div className="requirements-content">
          <div className="requirements-collection">
            <ScopeCollection model={model} />
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
            openWork={props.openWork}
          />
        )}
      </div>
    </section>
  )
}
