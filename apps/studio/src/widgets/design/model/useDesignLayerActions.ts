import { useMemo } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { EditorMenuAction } from '@/shared/types/index.ts'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function useDesignLayerActions(
  model: DesignEditorModel,
  targetId?: string,
) {
  const { t } = useTranslation()
  const flow = useReactFlow()
  return useMemo<EditorMenuAction[]>(() => {
    const ids =
      targetId && !model.selection.includes(targetId)
        ? [targetId]
        : model.selection
    const selected = model.page.nodes.filter((node) => ids.includes(node.id))
    const copies = model.page.nodes.filter(
      (node) => ids.includes(node.id) || ids.includes(node.parentId || ''),
    )
    const arrange = (front: boolean) => {
      const sorted = [...model.page.nodes].sort((a, b) => a.order - b.order)
      const picked = sorted.filter((node) => ids.includes(node.id))
      const rest = sorted.filter((node) => !ids.includes(node.id))
      model.save(
        (front ? [...rest, ...picked] : [...picked, ...rest]).map(
          (node, order) => ({ ...node, order }),
        ),
      )
    }
    return [
      {
        id: 'focus',
        label: t('Zoom to selection'),
        disabled: !selected.length,
        run: () => {
          void flow.fitView({
            nodes: ids.map((id) => ({ id })),
            padding: 0.3,
            maxZoom: 1.5,
          })
        },
      },
      {
        id: 'rename',
        label: t('Edit layer'),
        disabled: selected.length !== 1,
        run: () =>
          model.patch({ selection: ids, inspector: true, styles: false }),
      },
      {
        id: 'duplicate',
        label: t('Duplicate'),
        shortcut: 'Ctrl/⌘ D',
        disabled:
          !selected.length || model.page.nodes.length + copies.length > 500,
        run: () => model.duplicate(ids),
      },
      {
        id: 'front',
        label: t('Bring to front'),
        separator: true,
        disabled: !selected.length,
        run: () => arrange(true),
      },
      {
        id: 'back',
        label: t('Send to back'),
        disabled: !selected.length,
        run: () => arrange(false),
      },
      {
        id: 'hidden',
        label: t(
          selected.every((node) => node.hidden) ? 'Show layer' : 'Hide layer',
        ),
        separator: true,
        disabled: !selected.length,
        run: () =>
          model.edit({ hidden: !selected.every((node) => node.hidden) }, ids),
      },
      {
        id: 'locked',
        label: t(
          selected.every((node) => node.locked) ? 'Unlock layer' : 'Lock layer',
        ),
        disabled: !selected.length,
        run: () =>
          model.edit({ locked: !selected.every((node) => node.locked) }, ids),
      },
      {
        id: 'delete',
        label: t('Delete'),
        shortcut: 'Delete',
        separator: true,
        danger: true,
        disabled: !selected.length,
        run: () => model.remove(ids),
      },
    ]
  }, [flow, model, t, targetId])
}
