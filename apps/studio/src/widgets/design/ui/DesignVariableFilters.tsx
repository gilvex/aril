import { useCallback, type ChangeEvent } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignVariableFilters({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch } = model
  const search = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      patch({ variableQuery: e.target.value, variableLimit: 50 }),
    [patch],
  )
  const type = useCallback(
    (e: SelectChange) =>
      patch({ variableType: e.target.value, variableLimit: 50 }),
    [patch],
  )
  const used = useCallback(
    (e: SelectChange) =>
      patch({
        variableUsage: e.target.value as 'all' | 'used' | 'unused',
        variableLimit: 50,
      }),
    [patch],
  )
  return (
    <div className="library-filters">
      <input
        value={model.variableQuery}
        onChange={search}
        placeholder={t('Search variables')}
        aria-label={t('Search variables')}
      />
      <StudioSelect
        value={model.variableType}
        onChange={type}
        aria-label={t('Variable type')}
      >
        <option value="all">{t('All types')}</option>
        {['color', 'number', 'string', 'boolean'].map((type) => (
          <option key={type} value={type}>
            {t(type)}
          </option>
        ))}
      </StudioSelect>
      <StudioSelect
        value={model.variableUsage}
        onChange={used}
        aria-label={t('Usage filter')}
      >
        <option value="all">{t('All usages')}</option>
        <option value="used">{t('Used')}</option>
        <option value="unused">{t('Unused')}</option>
      </StudioSelect>
    </div>
  )
}
