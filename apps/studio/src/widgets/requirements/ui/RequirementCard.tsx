import { useCallback, type DragEvent, type ChangeEvent } from 'react'
import { Workflow } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { requirementOptions } from '../config/requirementOptions.ts'
import type { RequirementItemProps } from '../types/requirementItemProps.ts'
import { RequirementAvatars } from './RequirementAvatars.tsx'
import { RequirementBadge } from './RequirementBadge.tsx'
export function RequirementCard({ item, model }: RequirementItemProps) {
  const { t } = useTranslation()
  const startDrag = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.dataTransfer.setData(
        'application/x-pomegranate-requirement',
        item.id,
      )
      event.dataTransfer.effectAllowed = 'move'
      model.setViewState({ draggingId: item.id })
    },
    [model, item.id],
  )
  const endDrag = useCallback(
    () => model.setViewState({ draggingId: null, dropGroup: null }),
    [model],
  )
  const move = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) =>
      model.move([item.id], model.groupBy, event.target.value),
    [item.id, model],
  )
  const links = model.workspace.boards.filter((board) =>
    board.nodes.some((node) => node.data.requirements.includes(item.id)),
  ).length
  return (
    <article
      className={`req-card ${model.selected === item.id ? 'is-selected' : ''} ${model.draggingId === item.id ? 'is-dragging' : ''}`}
      draggable
      onDragStart={startDrag}
      onDragEnd={endDrag}
    >
      <div className="req-card-top">
        <small>{item.id}</small>
        <input
          type="checkbox"
          checked={model.checked.has(item.id)}
          aria-label={t('Select {{id}}', { id: item.id })}
          onChange={() => model.toggleChecked(item.id)}
        />
      </div>
      <button
        className="req-card-open"
        onClick={() => model.selectRequirement(item.id)}
        aria-pressed={model.selected === item.id}
      >
        {item.title}
      </button>
      <div className="req-card-meta">
        <span>{t(item.category)}</span>
        <RequirementBadge
          field={model.groupBy === 'status' ? 'priority' : 'status'}
          value={model.groupBy === 'status' ? item.priority : item.status}
        />
      </div>
      <div className="req-card-bottom">
        <span>
          <Workflow size={13} />
          {t('boardCount', { count: links })}
        </span>
        <RequirementAvatars
          people={model.peopleFor(item.id)}
          currentUserId={model.profile.id}
        />
      </div>
      <label className="req-card-move">
        {t('Move to')}
        <select
          aria-label={t('Move {{id}} to', { id: item.id })}
          value={item[model.groupBy]}
          onChange={move}
        >
          {requirementOptions[model.groupBy].map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
    </article>
  )
}
