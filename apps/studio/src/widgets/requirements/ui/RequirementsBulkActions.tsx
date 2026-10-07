import type { SelectChange } from '@/shared/types/selectChange.ts'
import { StudioActionBar, StudioSelect } from '@/shared/ui/index.tsx'
import { ActionBarButton } from 'vagabond-ui/action-bar'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { requirementOptions } from '../config/requirementOptions.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
export function RequirementsBulkActions({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  const change = useCallback(
    (event: SelectChange) => {
      const field = event.target.name as 'status' | 'priority' | 'category'
      model.move(model.checkedIds, field, event.target.value)
    },
    [model],
  )
  const hiddenCount = model.checkedIds.filter(
    (id) => !model.results.some((item) => item.id === id),
  ).length
  return (
    <StudioActionBar
      className="requirements-bulk"
      label={t('Bulk requirement actions')}
    >
      <strong>
        {t('{{count}} selected', { count: model.checkedIds.length })}
        {!!hiddenCount && (
          <small>
            {t('{{count}} hidden by filters', { count: hiddenCount })}
          </small>
        )}
      </strong>
      {(['status', 'priority', 'category'] as const).map((field) => (
        <StudioSelect
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
        </StudioSelect>
      ))}
      <ActionBarButton
        className="icon-button"
        aria-label={t('Clear selection')}
        onClick={() => model.setViewState({ checkedIds: [] })}
      >
        <X size={17} />
      </ActionBarButton>
    </StudioActionBar>
  )
}
