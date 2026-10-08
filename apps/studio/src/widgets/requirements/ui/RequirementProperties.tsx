import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { Requirement } from '@pomegranate/domain/workspace'
import { requirementOptions } from '../config/requirementOptions.ts'
import type { RequirementDetailsProps } from '../types/requirementDetailsProps.ts'
export function RequirementProperties({
  current,
  fieldProps,
  fieldHint,
  update,
}: RequirementDetailsProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const change = useCallback(
    (event: SelectChange) => {
      update({
        [event.target.name]: event.target.value,
      } as Partial<Requirement>)
    },
    [update],
  )
  return (
    <div className="req-properties">
      {(['status', 'category'] as const).map((field) => (
        <label key={field}>
          <span>{t(field === 'status' ? 'Delivery status' : 'Area')}</span>
          <StudioSelect
            disabled={readOnly}
            name={field}
            aria-label={t(
              field === 'status' ? 'Delivery status' : 'Requirement area',
            )}
            {...fieldProps(field)}
            value={current[field]}
            onChange={change}
          >
            {requirementOptions[field].map((value) => (
              <option key={value} value={value}>
                {t(value)}
              </option>
            ))}
          </StudioSelect>
          {fieldHint(field)}
        </label>
      ))}
    </div>
  )
}
