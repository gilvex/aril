import { useCallback, type MouseEvent } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { Requirement } from '@pomegranate/domain/workspace'
import type { RequirementDetailsProps } from '../types/requirementDetailsProps.ts'
import { RequirementProperties } from './RequirementProperties.tsx'
export function ScopeProperties(props: RequirementDetailsProps) {
  const { current, update, propertiesOpen, toggleProperties } = props
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const toggle = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault()
      toggleProperties()
    },
    [toggleProperties],
  )
  const decision = useCallback(
    (event: SelectChange) =>
      update({ decision: event.target.value as Requirement['decision'] }),
    [update],
  )
  const priority = useCallback(
    (event: SelectChange) =>
      update({ priority: event.target.value as Requirement['priority'] }),
    [update],
  )
  const workspaceWide = useCallback(
    () => update({ workspaceWide: !current.workspaceWide }),
    [current.workspaceWide, update],
  )
  return (
    <div className="scope-properties">
      <div className="scope-property-row">
        <StudioSelect
          name="decision"
          aria-label={t('Decision')}
          disabled={readOnly}
          value={current.decision || 'Proposed'}
          onChange={decision}
        >
          {['Proposed', 'Agreed', 'Deferred'].map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </StudioSelect>
        <StudioSelect
          name="priority"
          aria-label={t('Priority')}
          {...props.fieldProps('priority')}
          disabled={readOnly}
          value={current.priority}
          onChange={priority}
        >
          {['Must have', 'Should have', 'Later'].map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </StudioSelect>
      </div>
      <details open={propertiesOpen}>
        <summary onClick={toggle}>{t('More properties')}</summary>
        <label className="scope-workspace-check">
          <input
            type="checkbox"
            disabled={readOnly}
            checked={!!current.workspaceWide}
            onChange={workspaceWide}
          />
          {t('Applies across this workspace')}
        </label>
        <RequirementProperties {...props} />
      </details>
    </div>
  )
}
