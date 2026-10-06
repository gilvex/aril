import { X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { requirementOptions } from '../config/requirementOptions.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
export function RequirementsFilters({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  const active =
    model.category !== 'All areas' ||
    model.status ||
    model.priority ||
    model.query
  return (
    <div className="requirements-filters">
      {model.view === 'board' && (
        <label>
          {t('Group by')}
          <select
            aria-label={t('Group requirements by')}
            value={model.groupBy}
            onChange={(event) =>
              model.setViewState({
                groupBy: event.target.value as 'status' | 'priority',
              })
            }
          >
            <option value="status">{t('Status')}</option>
            <option value="priority">{t('Priority')}</option>
          </select>
        </label>
      )}
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
      {active && (
        <button className="button subtle" onClick={model.clearFilters}>
          <X size={13} />
          {t('Clear filters')}
        </button>
      )}
      <span className="requirements-result-count" role="status">
        {t('requirementCount', { count: model.results.length })}
      </span>
    </div>
  )
}
