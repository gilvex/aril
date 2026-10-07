import { useCallback, useMemo, type MouseEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useReactFlow } from '@xyflow/react'
import { designTools } from '../config/designTools.ts'
import { useDesignLayerActions } from './useDesignLayerActions.ts'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
import type { EditorMenuAction } from '@/shared/types/index.ts'
export function useDesignContextMenu(model: DesignEditorModel) {
  const { t } = useTranslation()
  const flow = useReactFlow()
  const layers = useDesignLayerActions(model)
  const prepare = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (
        (event.target as HTMLElement).closest(
          'input, textarea, [contenteditable="true"]',
        )
      )
        return
      const nodeId = (event.target as HTMLElement)
        .closest('.react-flow__node')
        ?.getAttribute('data-id')
      const rect = event.currentTarget.getBoundingClientRect()
      const point = flow.screenToFlowPosition({
        x: event.clientX || rect.left + rect.width / 2,
        y: event.clientY || rect.top + rect.height / 2,
      })
      model.patch({
        contextPoint: point,
        selection: nodeId
          ? model.selection.includes(nodeId)
            ? model.selection
            : [nodeId]
          : [],
        editingId: null,
      })
    },
    [flow, model],
  )
  const actions = useMemo<EditorMenuAction[]>(
    () => [
      ...(model.selection.length ? layers : []),
      ...designTools.map(({ kind, label, ...rest }, index) => ({
        id: label,
        label: t(label),
        separator: index === 0 && !!model.selection.length,
        disabled: model.page.nodes.length >= 500,
        run: () => {
          const node = model.page.nodes.find(
            (item) => item.id === model.selection[0],
          )
          const parentId =
            node?.parentId || (node?.kind === 'frame' ? node.id : undefined)
          const parent = model.page.nodes.find((item) => item.id === parentId)
          const point =
            model.contextPoint ||
            flow.screenToFlowPosition({
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            })
          model.add(
            kind,
            parent && kind !== 'frame'
              ? { x: point.x - parent.x, y: point.y - parent.y }
              : point,
            'mobile' in rest && !!rest.mobile,
            true,
          )
        },
      })),
      {
        id: 'selectAll',
        label: t('Select all layers'),
        separator: true,
        disabled: !model.page.nodes.length,
        run: () =>
          model.patch({
            selection: model.page.nodes
              .filter((node) => !node.hidden && !node.locked)
              .map((node) => node.id),
          }),
      },
      {
        id: 'fitAll',
        label: t('Fit view'),
        run: () => {
          void flow.fitView({ padding: 0.15, maxZoom: 1 })
        },
      },
    ],
    [flow, layers, model, t],
  )
  return { prepare, actions }
}
