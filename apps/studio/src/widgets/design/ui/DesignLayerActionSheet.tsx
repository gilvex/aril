import { useCallback, useEffect, useRef, type MouseEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useDesignLayerActions } from '../model/useDesignLayerActions.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLayerActionSheet({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const back = useRef<HTMLButtonElement>(null)
  const actions = useDesignLayerActions(
    model,
    model.layerActionsId ?? undefined,
  )
  const node = model.page.nodes.find((item) => item.id === model.layerActionsId)
  const close = useCallback(
    () => model.patch({ layerActionsId: null }),
    [model],
  )
  useEffect(() => {
    back.current?.focus()
  }, [])
  const goBack = useCallback(() => {
    const id = model.layerActionsId
    close()
    requestAnimationFrame(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        '[data-layer-actions]',
      )
      Array.from(buttons)
        .find(
          (button) =>
            button.dataset.layerActions === id &&
            button.getClientRects().length,
        )
        ?.focus({ preventScroll: true })
    })
  }, [close, model.layerActionsId])
  const run = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const action = actions.find(
        (item) => item.id === event.currentTarget.dataset.action,
      )
      if (!action || action.disabled) return
      close()
      action.run()
    },
    [actions, close],
  )
  return (
    <section
      className="design-layer-action-sheet"
      aria-label={t('Layer actions')}
    >
      <header>
        <button
          ref={back}
          className="icon-button"
          onClick={goBack}
          aria-label={t('Layers')}
        >
          <ArrowLeft size={18} />
        </button>
        <strong>{node?.name ?? t('Layer actions')}</strong>
      </header>
      <div className="design-layer-action-list">
        {actions.map((action) => (
          <button
            key={action.id}
            data-action={action.id}
            className={`${action.danger ? 'danger' : ''}${action.separator ? ' separated' : ''}`}
            disabled={action.disabled}
            onClick={run}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  )
}
