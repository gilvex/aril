import { useCallback, useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useCanvasTools } from './useCanvasTools.ts'
import type { CanvasDrawingProps } from '../types/canvasDrawingProps.ts'
export function useDrawingSelection({
  strokes = {},
  onChange,
  disabled,
  scope,
}: CanvasDrawingProps) {
  const { selectedStrokes, drawing, patch, getState } = useCanvasTools()
  const role = useWorkspaceRole()
  const flow = useReactFlow()
  const selectable = !disabled && !drawing && role !== 'viewer' && role !== null
  const selected = selectedStrokes.filter((id) => Object.hasOwn(strokes, id))
  const remove = useCallback(() => {
    if (!selectable) return
    const ids = getState().selectedStrokes
    if (!ids.some((id) => Object.hasOwn(strokes, id))) return
    const next = { ...strokes }
    for (const id of ids) delete next[id]
    onChange(next)
    patch({ selectedStrokes: [] })
  }, [selectable, getState, strokes, onChange, patch])
  const select = useCallback(
    (id: string, additive: boolean) => {
      if (!selectable) return
      const current = getState().selectedStrokes
      patch({
        selectedStrokes: additive
          ? current.includes(id)
            ? current.filter((value) => value !== id)
            : [...current, id]
          : [id],
      })
      flow.setNodes((nodes) =>
        nodes.map((node) =>
          node.selected ? { ...node, selected: false } : node,
        ),
      )
      flow.setEdges((edges) =>
        edges.map((edge) =>
          edge.selected ? { ...edge, selected: false } : edge,
        ),
      )
    },
    [selectable, getState, patch, flow],
  )
  useEffect(() => {
    patch({ selectedStrokes: [] })
  }, [scope, disabled, drawing, role, patch])
  useEffect(() => {
    const clear = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        event.target.closest('[data-stroke-id],.drawing-selection-tools')
      )
        return
      if (getState().selectedStrokes.length) patch({ selectedStrokes: [] })
    }
    const key = (event: KeyboardEvent) => {
      if (
        !selectable ||
        !getState().selectedStrokes.length ||
        event.defaultPrevented
      )
        return
      if (
        event.target instanceof Element &&
        event.target.closest('input,textarea,select,[contenteditable="true"]')
      )
        return
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      event.preventDefault()
      event.stopImmediatePropagation()
      remove()
    }
    document.addEventListener('pointerdown', clear, true)
    document.addEventListener('keydown', key, true)
    return () => {
      document.removeEventListener('pointerdown', clear, true)
      document.removeEventListener('keydown', key, true)
    }
  }, [selectable, getState, patch, remove])
  return { selected, selectable, select, remove }
}
