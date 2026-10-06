import { X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
export function RequirementFilterChips({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  return (
    <div className="requirements-filter-chips" aria-label={t('Active filters')}>
      {model.query && (
        <button
          title={model.query}
          aria-label={t('Clear search')}
          onClick={() => model.setQuery('')}
        >
          <span>“{model.query}”</span>
          <X size={12} />
        </button>
      )}
      {model.category !== 'All areas' && (
        <button
          aria-label={t('Remove area filter')}
          onClick={() => model.setCategory('All areas')}
        >
          <span>{t(model.category)}</span>
          <X size={12} />
        </button>
      )}
      {model.priority && (
        <button
          aria-label={t('Remove priority filter')}
          onClick={() => model.setViewState({ priority: '' })}
        >
          <span>{t(model.priority)}</span>
          <X size={12} />
        </button>
      )}
      {model.status && (
        <button
          aria-label={t('Remove status filter')}
          onClick={() => model.setViewState({ status: '' })}
        >
          <span>{t(model.status)}</span>
          <X size={12} />
        </button>
      )}
    </div>
  )
}
