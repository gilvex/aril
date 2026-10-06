import { useCallback, type ChangeEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementItemProps } from '../types/requirementItemProps.ts'
import { RequirementAvatars } from './RequirementAvatars.tsx'
import { RequirementBadge } from './RequirementBadge.tsx'
export function RequirementRow({ item, model }: RequirementItemProps) {
  const { t } = useTranslation()
  const toggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      model.toggleChecked(item.id, (event.nativeEvent as MouseEvent).shiftKey),
    [model, item.id],
  )
  return (
    <div
      className={`req-row ${model.selected === item.id ? 'is-selected' : ''}`}
    >
      <input
        type="checkbox"
        aria-label={t('Select {{id}}', { id: item.id })}
        checked={model.checked.has(item.id)}
        onChange={toggle}
      />
      <button
        className="req-row-open"
        aria-label={`${item.id} ${item.title}`}
        aria-pressed={model.selected === item.id}
        onClick={() => model.selectRequirement(item.id)}
      >
        <span className="req-title">
          <small>{item.id}</small>
          <span>
            <strong>{item.title}</strong>
            <small>{t(item.category)}</small>
          </span>
          <RequirementAvatars
            people={model.peopleFor(item.id)}
            currentUserId={model.profile.id}
          />
        </span>
        <RequirementBadge value={item.priority} field="priority" />
        <RequirementBadge value={item.status} field="status" />
      </button>
    </div>
  )
}
