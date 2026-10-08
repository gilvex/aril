import { useEffect, useRef, type RefObject } from 'react'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
import { designDockTarget } from '../utils/designDockTarget.ts'
import { designDockLayout } from '../utils/designDockLayout.ts'
import type { DesignDockEdge } from '../types/designDockEdge.ts'

export function useDesignPanelDrag(
  ref: RefObject<HTMLDivElement | null>,
  model: DesignEditorModel,
  side: 'left' | 'right',
) {
  const latest = useRef(model)
  useEffect(() => {
    latest.current = model
  }, [model])
  const { patch } = model
  useEffect(() => {
    const element = ref.current
    if (!element) return
    let gesture: {
      id: number
      x: number
      y: number
      left: number
      top: number
      moved: boolean
      edge: DesignDockEdge | null
      original: Pick<
        DesignEditorModel,
        'layersDocked' | 'inspectorDocked' | 'panelPositions'
      >
    } | null = null
    const down = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (
        latest.current.compact ||
        event.button !== 0 ||
        !target.closest('header,.surface-grip') ||
        target.closest(
          'input,textarea,select,a,button:not(.surface-grip),[contenteditable="true"]',
        )
      )
        return
      const bounds = element
        .closest('[data-surface-bounds]')!
        .getBoundingClientRect()
      const box = element.getBoundingClientRect()
      const { layersDocked, inspectorDocked, panelPositions } = latest.current
      gesture = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left:
          event.clientX -
          bounds.left -
          Math.min(
            event.clientX - box.left,
            (side === 'left'
              ? latest.current.layersWidth
              : latest.current.inspectorWidth) - 24,
          ),
        top: box.top - bounds.top,
        moved: false,
        edge: null,
        original: { layersDocked, inspectorDocked, panelPositions },
      }
      event.preventDefault()
      element.setPointerCapture(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      if (!gesture || gesture.id !== event.pointerId) return
      const dx = event.clientX - gesture.x,
        dy = event.clientY - gesture.y
      if (!gesture.moved && Math.hypot(dx, dy) < 4) return
      gesture.moved = true
      element.dataset.dragging = 'true'
      const bounds = element
        .closest('[data-surface-bounds]')!
        .getBoundingClientRect()
      const edge = designDockTarget(
        event.clientX - bounds.left,
        event.clientY - bounds.top,
        bounds.width,
        bounds.height,
      )
      gesture.edge = edge
      patch({
        ...(side === 'left'
          ? { layersDocked: null }
          : { inspectorDocked: null }),
        panelPositions: {
          ...latest.current.panelPositions,
          [side]: {
            x: Math.max(0, gesture.left + dx),
            y: Math.max(0, gesture.top + dy),
          },
        },
        dockPreview: edge ? { edge, side } : null,
        dockActive: side,
      })
    }
    const end = (cancel = false) => {
      const drag = gesture
      gesture = null
      if (!drag) return
      if (element.hasPointerCapture(drag.id))
        element.releasePointerCapture(drag.id)
      delete element.dataset.dragging
      if (!drag.moved) return
      const edge = drag.edge
      patch(
        cancel
          ? { ...drag.original, dockPreview: null }
          : {
              ...(side === 'left'
                ? { layersDocked: edge }
                : { inspectorDocked: edge }),
              dockPreview: null,
            },
      )
    }
    const up = () => end()
    const cancel = () => end(true)
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && gesture) {
        event.preventDefault()
        event.stopPropagation()
        cancel()
        return
      }
      if (!(event.target as HTMLElement).closest('.surface-grip')) return
      if (
        !['Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
          event.key,
        )
      )
        return
      event.preventDefault()
      event.stopPropagation()
      const state = latest.current
      const rect = designDockLayout(state).panels[side]
      const step = event.shiftKey ? 40 : 10
      const position =
        event.key === 'Home'
          ? null
          : {
              x: Math.max(
                0,
                rect.left +
                  (event.key === 'ArrowRight'
                    ? step
                    : event.key === 'ArrowLeft'
                      ? -step
                      : 0),
              ),
              y: Math.max(
                0,
                rect.top +
                  (event.key === 'ArrowDown'
                    ? step
                    : event.key === 'ArrowUp'
                      ? -step
                      : 0),
              ),
            }
      patch({
        ...(side === 'left'
          ? { layersDocked: null }
          : { inspectorDocked: null }),
        panelPositions: { ...state.panelPositions, [side]: position },
      })
    }
    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', up)
    element.addEventListener('pointercancel', cancel)
    element.addEventListener('lostpointercapture', cancel)
    element.addEventListener('keydown', key)
    return () => {
      cancel()
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', cancel)
      element.removeEventListener('lostpointercapture', cancel)
      element.removeEventListener('keydown', key)
    }
  }, [ref, side, patch])
}
