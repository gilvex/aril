import { useMemo } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { groupDesignElements } from '@pomegranate/domain/design'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
import type { EditorMenuAction } from '@/shared/types/index.ts'
export function useDesignGroupingMenu(
  model: DesignEditorModel,
  targetId?: string,
) {
  const { t } = useTranslation()
  return useMemo<EditorMenuAction[]>(() => {
    const ids =
      targetId && !model.selection.includes(targetId)
        ? [targetId]
        : model.selection
    const nodes = model.page.nodes
    const selected = nodes.filter((node) => ids.includes(node.id))
    return [
      ...(['group', 'frame', 'mask'] as const).map((mode) => ({
        id: mode,
        label: t(
          mode === 'mask'
            ? 'Use as mask'
            : mode === 'frame'
              ? 'Frame selection'
              : 'Group selection',
        ),
        shortcut: mode === 'group' ? 'Ctrl/⌘ G' : undefined,
        separator: mode === 'group',
        disabled:
          groupDesignElements(nodes, ids, '__check__', 'Group', mode) === nodes,
        run: () => model.group(mode, ids),
      })),
      {
        id: 'ungroup',
        label: t('Ungroup'),
        shortcut: 'Ctrl/⌘ Shift G',
        disabled: !selected.some(
          (node) => node.kind === 'group' && !node.locked,
        ),
        run: () => model.ungroup(ids),
      },
      {
        id: 'releaseMask',
        label: t('Release mask'),
        disabled: !selected.some((node) => node.maskId),
        run: () => model.edit({ maskId: undefined }, ids),
      },
    ]
  }, [model, t, targetId])
}
