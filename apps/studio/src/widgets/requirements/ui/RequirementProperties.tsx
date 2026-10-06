import { useCallback, type ChangeEvent } from 'react'
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
  const change = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      update({
        [event.target.name]: event.target.value,
      } as Partial<Requirement>)
    },
    [update],
  )
  return (
    <div className="req-properties">
      {(['status', 'priority', 'category'] as const).map((field) => (
        <label key={field}>
          <span>
            {t(
              field === 'status'
                ? 'Status'
                : field === 'priority'
                  ? 'Priority'
                  : 'Area',
            )}
          </span>
          <select
            name={field}
            aria-label={t(
              field === 'status'
                ? 'Requirement status'
                : field === 'priority'
                  ? 'Requirement priority'
                  : 'Requirement area',
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
          </select>
          {fieldHint(field)}
        </label>
      ))}
    </div>
  )
}
