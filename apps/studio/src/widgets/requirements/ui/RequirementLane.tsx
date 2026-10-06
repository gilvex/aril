import { useCallback, type DragEvent } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementLaneProps } from '../types/requirementLaneProps.ts'
import { RequirementCard } from './RequirementCard.tsx'
import { RequirementBadge } from './RequirementBadge.tsx'
export function RequirementLane({ model, value, items }: RequirementLaneProps) {
  const { t } = useTranslation()
  const over = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!model.draggingId) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      if (model.dropGroup !== value) model.setViewState({ dropGroup: value })
    },
    [model, value],
  )
  const drop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!model.draggingId) return
      event.preventDefault()
      model.move([model.draggingId], model.groupBy, value)
      model.setViewState({ draggingId: null, dropGroup: null })
    },
    [model, value],
  )
  const add = useCallback(
    () => model.add({ [model.groupBy]: value }),
    [model, value],
  )
  return (
    <section
      aria-label={t(value)}
      className={`req-lane ${model.dropGroup === value ? 'is-drop-target' : ''}`}
      onDragOver={over}
      onDrop={drop}
    >
      <header>
        <h2>
          <RequirementBadge field={model.groupBy} value={value} />
          <span>{items.length}</span>
        </h2>
        <button
          className="icon-button"
          aria-label={t('Add to {{group}}', { group: t(value) })}
          onClick={add}
        >
          <Plus size={17} />
        </button>
      </header>
      <div className="req-lane-cards">
        {items.map((item) => (
          <RequirementCard key={item.id} item={item} model={model} />
        ))}
        {!items.length && (
          <div className="req-lane-empty">
            {model.draggingId
              ? t('Drop requirement here')
              : t('No requirements here')}
            <button onClick={add}>{t('Add requirement')}</button>
          </div>
        )}
      </div>
    </section>
  )
}
