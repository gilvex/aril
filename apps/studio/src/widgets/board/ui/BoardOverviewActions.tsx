import { useMemo, useRef } from 'react'
import { MoreHorizontal, Plus } from 'lucide-react'
import { nodeKinds } from '@pomegranate/domain/workspace'
import { EditorActionMenu } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { kindLabels } from '../config/kindLabels.ts'
import type { BoardOverviewActionsProps } from '../types/boardOverviewActionsProps.ts'
export function BoardOverviewActions({
  board,
  addNode,
  fitBoard,
  rename,
  canEdit,
  titleRef,
}: BoardOverviewActionsProps) {
  const { t } = useTranslation()
  const focusAfterClose = useRef<HTMLInputElement | null>(null)
  const insert = useMemo(
    () =>
      nodeKinds.map((kind) => ({
        id: kind,
        label: t(kindLabels[kind]),
        run: () => addNode(kind),
        disabled: board.nodes.length >= 500 || !canEdit,
      })),
    [addNode, board.nodes.length, canEdit, t],
  )
  const actions = useMemo(
    () => [
      {
        id: 'rename',
        label: t('Rename board'),
        run: () => {
          focusAfterClose.current = titleRef.current
          rename()
        },
        disabled: !canEdit,
      },
      {
        id: 'fit',
        label: t('Fit to view'),
        run: () => {
          focusAfterClose.current = null
          fitBoard()
        },
        disabled: !board.nodes.length,
      },
    ],
    [board.nodes.length, canEdit, fitBoard, rename, titleRef, t],
  )
  return (
    <footer className="board-overview-actions">
      {canEdit && (
        <EditorActionMenu actions={insert} label={t('Add node')}>
          <button className="button">
            <Plus size={14} />
            {t('Add node')}
          </button>
        </EditorActionMenu>
      )}
      <EditorActionMenu
        actions={actions}
        label={t('Board actions')}
        focusAfterClose={focusAfterClose}
      >
        <button className="button">
          {t('Board actions')}
          <MoreHorizontal size={14} />
        </button>
      </EditorActionMenu>
    </footer>
  )
}
