import { Text } from '@/shared/ui/Text.tsx'
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
          <Text as="span">“{model.query}”</Text>
          <X size={12} />
        </button>
      )}
      {model.category !== 'All areas' && (
        <button
          aria-label={t('Remove area filter')}
          onClick={() => model.setCategory('All areas')}
        >
          <Text as="span">{t(model.category)}</Text>
          <X size={12} />
        </button>
      )}
      {model.priority && (
        <button
          aria-label={t('Remove priority filter')}
          onClick={() => model.setViewState({ priority: '' })}
        >
          <Text as="span">{t(model.priority)}</Text>
          <X size={12} />
        </button>
      )}
      {model.status && (
        <button
          aria-label={t('Remove status filter')}
          onClick={() => model.setViewState({ status: '' })}
        >
          <Text as="span">{t(model.status)}</Text>
          <X size={12} />
        </button>
      )}
    </div>
  )
}
