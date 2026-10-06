import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'
import { requirementOptions } from '../config/requirementOptions.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
export function RequirementsFilters({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  const reset = useCallback(
    () =>
      model.setViewState({ category: 'All areas', priority: '', status: '' }),
    [model],
  )
  return (
    <div className="requirements-filters">
      <label>
        {t('Area')}
        <select
          aria-label={t('Filter requirements by area')}
          value={model.category}
          onChange={(event) => model.setCategory(event.target.value)}
        >
          <option value="All areas">{t('All areas')}</option>
          {requirementOptions.category.map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('Priority')}
        <select
          aria-label={t('Filter requirements by priority')}
          value={model.priority}
          onChange={(event) =>
            model.setViewState({
              priority: event.target.value as typeof model.priority,
            })
          }
        >
          <option value="">{t('All priorities')}</option>
          {requirementOptions.priority.map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('Status')}
        <select
          aria-label={t('Filter requirements by status')}
          value={model.status}
          onChange={(event) =>
            model.setViewState({
              status: event.target.value as typeof model.status,
            })
          }
        >
          <option value="">{t('All statuses')}</option>
          {requirementOptions.status.map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
      <button
        className="req-reset-filters"
        disabled={
          model.category === 'All areas' && !model.priority && !model.status
        }
        onClick={reset}
      >
        {t('Reset filters')}
      </button>
    </div>
  )
}
