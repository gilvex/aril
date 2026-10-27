import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
import { RequirementRow } from './RequirementRow.tsx'
export function RequirementsTable({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  const all =
    model.results.length > 0 &&
    model.results.every((item) => model.checked.has(item.id))
  const toggleAll = useCallback(() => {
    const visible = new Set(model.results.map((item) => item.id))
    model.setViewState({
      checkedIds: all
        ? model.checkedIds.filter((id) => !visible.has(id))
        : [...new Set([...model.checkedIds, ...visible])],
    })
  }, [model, all])
  return (
    <div className="requirements-table">
      <div className="req-table-head">
        <input
          type="checkbox"
          aria-label={t('Select all visible requirements')}
          checked={all}
          onChange={toggleAll}
        />
        <Text as="span">{t('Requirement')}</Text>
        <Text as="span">{t('Priority')}</Text>
        <Text as="span">{t('Status')}</Text>
      </div>
      {model.results.map((item) => (
        <RequirementRow key={item.id} item={item} model={model} />
      ))}
      <footer className="req-list-footer">
        <Text>{t('Shift + click to select a range')}</Text>
      </footer>
    </div>
  )
}
