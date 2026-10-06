import { Workflow, MoreHorizontal } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { requirementOptions } from '../config/requirementOptions.ts'
import type { RequirementItemProps } from '../types/requirementItemProps.ts'
import { RequirementAvatars } from './RequirementAvatars.tsx'
import { RequirementBadge } from './RequirementBadge.tsx'
import { useRequirementCard } from '../model/useRequirementCard.ts'
export function RequirementCard({ item, model }: RequirementItemProps) {
  const { t } = useTranslation()
  const handlers = useRequirementCard({ item, model })
  const people = model.peopleFor(item.id)
  const editors = people.filter(
    (person) =>
      person.profile.id !== model.profile.id && person.requirement.field,
  )
  const links = model.workspace.boards.filter((board) =>
    board.nodes.some((node) => node.data.requirements.includes(item.id)),
  ).length
  return (
    <article
      className={
        'req-card ' +
        (model.selected === item.id ? 'is-selected ' : '') +
        (model.checked.has(item.id) ? 'is-checked ' : '') +
        (model.draggingId === item.id ? 'is-dragging' : '')
      }
      draggable
      onDragStart={handlers.startDrag}
      onDragEnd={handlers.endDrag}
      onClick={handlers.open}
      onKeyDown={handlers.keys}
    >
      <div className="req-card-top">
        <button
          className="req-card-open"
          onClick={() => model.selectRequirement(item.id)}
          aria-pressed={model.selected === item.id}
        >
          <small>{item.id}</small>
          <strong>{item.title}</strong>
        </button>
        <RequirementAvatars people={people} currentUserId={model.profile.id} />
        <input
          type="checkbox"
          checked={model.checked.has(item.id)}
          aria-label={t('Select {{id}}', { id: item.id })}
          onChange={() => model.toggleChecked(item.id)}
        />
      </div>
      <div className="req-card-meta">
        <span className="req-card-category">{t(item.category)}</span>
        <RequirementBadge
          field={model.groupBy === 'status' ? 'priority' : 'status'}
          value={model.groupBy === 'status' ? item.priority : item.status}
        />
        <span className="req-card-links">
          <Workflow size={12} />
          {t('boardCount', { count: links })}
        </span>
        <button
          ref={handlers.menuButton}
          className="icon-button req-card-menu-toggle"
          aria-label={t('Actions for {{id}}', { id: item.id })}
          aria-expanded={model.menuId === item.id}
          onClick={handlers.toggleMenu}
        >
          <MoreHorizontal size={17} />
        </button>
      </div>
      {!!editors.length && (
        <div className="req-card-editing">
          {editors.map((person) => person.profile.name).join(', ')} ·{' '}
          {t('editing')}
        </div>
      )}
      {model.menuId === item.id && (
        <label className="req-card-move">
          {t('Move to')}
          <select
            ref={handlers.menu}
            aria-label={t('Move {{id}} to', { id: item.id })}
            value={item[model.groupBy]}
            onChange={handlers.moveItem}
          >
            {requirementOptions[model.groupBy].map((value) => (
              <option key={value} value={value}>
                {t(value)}
              </option>
            ))}
          </select>
        </label>
      )}
    </article>
  )
}
