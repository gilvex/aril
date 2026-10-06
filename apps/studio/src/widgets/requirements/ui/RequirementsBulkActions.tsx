import { useCallback, type ChangeEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { requirementOptions } from '../config/requirementOptions.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
export function RequirementsBulkActions({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  const change = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const field = event.target.name as 'status' | 'priority' | 'category'
      model.move(model.checkedIds, field, event.target.value)
    },
    [model],
  )
  return (
    <div
      className="requirements-bulk"
      aria-label={t('Bulk requirement actions')}
    >
      <strong>
        {t('{{count}} selected', { count: model.checkedIds.length })}
      </strong>
      {(['status', 'priority', 'category'] as const).map((field) => (
        <select
          key={field}
          name={field}
          value=""
          onChange={change}
          aria-label={t('Change selected {{field}}', {
            field: t(
              field === 'category'
                ? 'Area'
                : field === 'status'
                  ? 'Status'
                  : 'Priority',
            ),
          })}
        >
          <option value="" disabled>
            {t(
              field === 'category'
                ? 'Area'
                : field === 'status'
                  ? 'Status'
                  : 'Priority',
            )}
          </option>
          {requirementOptions[field].map((value) => (
            <option value={value} key={value}>
              {t(value)}
            </option>
          ))}
        </select>
      ))}
      <button
        className="button subtle"
        onClick={() => model.setViewState({ checkedIds: [] })}
      >
        {t('Clear selection')}
      </button>
    </div>
  )
}
