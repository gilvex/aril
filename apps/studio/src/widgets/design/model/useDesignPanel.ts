import { useCallback, useRef } from 'react'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
import { useDesignPanelResize } from './useDesignPanelResize.ts'
import { useDesignPanelDrag } from './useDesignPanelDrag.ts'
import { useDesignDockMenu } from './useDesignDockMenu.ts'
import { designDockLayout } from '../utils/designDockLayout.ts'
export function useDesignPanel(
  model: DesignEditorModel,
  side: 'left' | 'right',
) {
  const ref = useRef<HTMLDivElement>(null)
  const { patch } = model
  const left = side === 'left'
  const edge = left ? model.layersDocked : model.inspectorDocked
  const horizontal = edge === 'top' || edge === 'bottom'
  const layout = designDockLayout(model)
  const rect = layout.panels[side]
  const grouped = !!edge && model.layersDocked === model.inspectorDocked
  const limit = Math.max(
    0,
    edge
      ? Math.min(
          480,
          (model.panelSpace - 320) /
            (layout.insets.left && layout.insets.right ? 2 : 1),
        )
      : Math.min(800, model.panelSpace - 16),
  )
  const heightLimit = Math.max(
    0,
    edge
      ? Math.min(
          480,
          (model.panelVerticalSpace - 240) /
            (layout.insets.top && layout.insets.bottom ? 2 : 1),
        )
      : model.panelVerticalSpace - 16,
  )
  const changeWidth = useCallback(
    (width: number) =>
      patch(
        grouped
          ? { layersWidth: width, inspectorWidth: width }
          : left
            ? { layersWidth: width }
            : {
                inspectorWidth: width,
                ...(!edge
                  ? {
                      panelPositions: {
                        ...model.panelPositions,
                        right: {
                          x: Math.max(0, rect.left + rect.width - width),
                          y: rect.top,
                        },
                      },
                    }
                  : {}),
              },
      ),
    [
      grouped,
      left,
      patch,
      edge,
      model.panelPositions,
      rect.left,
      rect.width,
      rect.top,
    ],
  )
  const changeHeight = useCallback(
    (height: number) =>
      patch(
        horizontal
          ? grouped
            ? { layersDockHeight: height, inspectorDockHeight: height }
            : left
              ? { layersDockHeight: height }
              : { inspectorDockHeight: height }
          : grouped
            ? { layersHeight: height, inspectorHeight: height }
            : left
              ? { layersHeight: height }
              : { inspectorHeight: height },
      ),
    [grouped, left, patch, horizontal],
  )
  const resize = useDesignPanelResize(
    rect.width,
    limit,
    edge === 'right' ? 'right' : edge === 'left' ? 'left' : side,
    changeWidth,
  )
  const resizeHeight = useDesignPanelResize(
    horizontal ? layout.insets[edge] : rect.height,
    heightLimit,
    edge === 'bottom' ? 'top' : 'bottom',
    changeHeight,
    edge ? 280 : left ? 520 : 600,
  )
  useDesignPanelDrag(ref, model, side)
  const actions = useDesignDockMenu(model, side)
  return {
    ref,
    left,
    edge,
    horizontal,
    layout,
    rect,
    limit,
    heightLimit,
    resize,
    resizeHeight,
    actions,
  }
}
