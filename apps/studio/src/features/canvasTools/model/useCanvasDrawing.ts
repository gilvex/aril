import { useCallback, useEffect, type PointerEvent } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useCanvasTools } from './useCanvasTools.ts'
import type { CanvasDrawingProps } from '../types/canvasDrawingProps.ts'
export function useCanvasDrawing({
  strokes = {},
  onChange,
  disabled,
  scope,
}: CanvasDrawingProps) {
  const { mode, drawing, draft, patch, getState } = useCanvasTools()
  const flow = useReactFlow()
  const role = useWorkspaceRole()
  const active =
    mode === 'draw' &&
    !!drawing &&
    !disabled &&
    role !== 'viewer' &&
    role !== null
  useEffect(() => {
    patch({ draft: null, pointerId: null, drawing: null })
  }, [scope, disabled, role, patch])
  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key === 'Escape')
        patch({ draft: null, pointerId: null, drawing: null })
    }
    document.addEventListener('keydown', cancel)
    return () => document.removeEventListener('keydown', cancel)
  }, [patch])
  const point = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const value = flow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      return {
        x: Math.max(-1e6, Math.min(1e6, Math.round(value.x * 10) / 10)),
        y: Math.max(-1e6, Math.min(1e6, Math.round(value.y * 10) / 10)),
      }
    },
    [flow],
  )
  const start = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (!active || event.button !== 0 || getState().pointerId !== null) return
      event.preventDefault()
      event.stopPropagation()
      if (drawing === 'eraser') {
        const id = (event.target as Element).getAttribute('data-stroke-id')
        if (id && Object.hasOwn(strokes, id)) {
          const next = { ...strokes }
          delete next[id]
          onChange(next)
        }
        return
      }
      if (Object.keys(strokes).length >= 500) return
      event.currentTarget.setPointerCapture(event.pointerId)
      const state = getState()
      const p = point(event)
      patch({
        pointerId: event.pointerId,
        draft: {
          points: [p, p],
          color: state.color,
          width:
            drawing === 'marker' ? Math.min(24, state.width * 3) : state.width,
          opacity: drawing === 'marker' ? 0.35 : 1,
        },
      })
    },
    [active, drawing, getState, strokes, onChange, patch, point],
  )
  const move = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const state = getState()
      if (
        !active ||
        state.pointerId !== event.pointerId ||
        !state.draft ||
        state.draft.points.length >= 2000
      )
        return
      const p = point(event)
      const last = state.draft.points.at(-1)!
      if (Math.hypot(p.x - last.x, p.y - last.y) < 1 / flow.getZoom()) return
      patch({ draft: { ...state.draft, points: [...state.draft.points, p] } })
    },
    [active, getState, point, flow, patch],
  )
  const finish = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const state = getState()
      if (state.pointerId !== event.pointerId) return
      if (active && state.draft && Object.keys(strokes).length < 500)
        onChange({ ...strokes, [crypto.randomUUID()]: state.draft })
      patch({ draft: null, pointerId: null })
      event.currentTarget.releasePointerCapture(event.pointerId)
    },
    [active, getState, strokes, onChange, patch],
  )
  const cancel = useCallback(
    () => patch({ draft: null, pointerId: null }),
    [patch],
  )
  return { active, drawing, draft, start, move, finish, cancel }
}
