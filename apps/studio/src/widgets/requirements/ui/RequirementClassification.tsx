import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useRequirementClassificationHandlers } from '../model/useRequirementClassificationHandlers.tsx'

import type { RequirementClassificationProps } from '../types/requirementClassificationProps.ts'
export function RequirementClassification({
  fieldProps,
  current,
  update,
  fieldHint,
}: RequirementClassificationProps) {
  const { t } = useTranslation()

  const { handleRequirementPriorityChange, handleRequirementStatusChange } =
    useRequirementClassificationHandlers({ update })
  return (
    <div className="field-row">
      <label>
        {t('Priority')}
        <StudioSelect
          {...fieldProps('priority')}
          aria-label={t('Requirement priority')}
          value={current.priority}
          onChange={handleRequirementPriorityChange}
        >
          {['Must have', 'Should have', 'Later'].map((x) => (
            <option key={x} value={x}>
              {t(x)}
            </option>
          ))}
        </StudioSelect>
        {fieldHint('priority')}
      </label>
      <label>
        {t('Status')}
        <StudioSelect
          aria-label={t('Requirement status')}
          {...fieldProps('status')}
          value={current.status}
          onChange={handleRequirementStatusChange}
        >
          {['Captured', 'Designing', 'Ready'].map((x) => (
            <option key={x} value={x}>
              {t(x)}
            </option>
          ))}
        </StudioSelect>
        {fieldHint('status')}
      </label>
    </div>
  )
}
