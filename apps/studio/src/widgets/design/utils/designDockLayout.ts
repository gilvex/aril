import type { DesignEditorState } from '../types/designEditorState.ts'
import type { DesignDockLayout } from '../types/designDockLayout.ts'
import type { DesignDockEdge } from '../types/designDockEdge.ts'
import type { DesignDockRect } from '../types/designDockRect.ts'

export function designDockLayout(state: DesignEditorState): DesignDockLayout {
  const width = Math.max(0, state.panelSpace),
    height = Math.max(0, state.panelVerticalSpace)
  const edges = {
    left: state.layers && !state.compact ? state.layersDocked : null,
    right: state.inspector && !state.compact ? state.inspectorDocked : null,
  }
  const insets = { left: 0, right: 0, top: 0, bottom: 0 }
  const clamp = (value: number, max: number) =>
    Math.max(0, Math.min(value, max))
  const verticalEdges = new Set(
    Object.values(edges).filter((edge) => edge === 'left' || edge === 'right'),
  ).size
  const horizontalEdges = new Set(
    Object.values(edges).filter((edge) => edge === 'top' || edge === 'bottom'),
  ).size
  for (const side of ['left', 'right'] as const) {
    const edge = edges[side]
    if (!edge) continue
    const vertical = edge === 'left' || edge === 'right'
    const size = vertical
      ? side === 'left'
        ? state.layersWidth
        : state.inspectorWidth
      : side === 'left'
        ? state.layersDockHeight
        : state.inspectorDockHeight
    const limit = vertical
      ? Math.min(480, Math.max(0, width - 320) / Math.max(1, verticalEdges))
      : Math.min(480, Math.max(0, height - 240) / Math.max(1, horizontalEdges))
    insets[edge] = Math.max(insets[edge], clamp(size, limit))
  }
  const edgeRect = (edge: DesignDockEdge): DesignDockRect => {
    if (edge === 'top' || edge === 'bottom')
      return {
        left: 0,
        top: edge === 'top' ? 0 : height - insets.bottom,
        width,
        height: insets[edge],
      }
    return {
      left: edge === 'left' ? 0 : width - insets.right,
      top: insets.top,
      width: insets[edge],
      height: height - insets.top - insets.bottom,
    }
  }
  const groupEdge = edges.left && edges.left === edges.right ? edges.left : null
  const group =
    groupEdge && state.dockMode === 'tabs'
      ? { edge: groupEdge, rect: edgeRect(groupEdge) }
      : null
  const panels = {} as DesignDockLayout['panels']
  for (const side of ['left', 'right'] as const) {
    const edge = edges[side]
    if (edge) {
      const rect = edgeRect(edge)
      if (group) {
        rect.top += 36
        rect.height = Math.max(0, rect.height - 36)
      } else if (groupEdge) {
        if (edge === 'top' || edge === 'bottom') {
          rect.width /= 2
          if (side === 'right') rect.left += rect.width
        } else {
          rect.height /= 2
          if (side === 'right') rect.top += rect.height
        }
      }
      panels[side] = rect
    } else {
      const w = clamp(
        side === 'left' ? state.layersWidth : state.inspectorWidth,
        width - 16,
      )
      const h = clamp(
        side === 'left' ? state.layersHeight : state.inspectorHeight,
        height - 16,
      )
      const position = state.panelPositions[side]
      panels[side] = {
        width: w,
        height: h,
        left: clamp(
          position?.x ?? (side === 'left' ? 18 : width - w - 18),
          width - w - 8,
        ),
        top: clamp(position?.y ?? (side === 'left' ? 124 : 66), height - h - 8),
      }
    }
  }
  return { insets, panels, group }
}
