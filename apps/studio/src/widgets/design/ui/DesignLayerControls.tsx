import { useCallback } from 'react'
import { Eye, EyeOff, Lock, Unlock, MoreHorizontal } from 'lucide-react'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { EditorActionMenu } from '@/shared/ui/index.tsx'
import type { DesignLayerControlsProps } from '../types/designLayerControlsProps.ts'
export function DesignLayerControls({
  node,
  model,
  actions,
}: DesignLayerControlsProps) {
  const { t } = useTranslation()
  const role = useWorkspaceRole()
  const readOnly = role === 'viewer' || role === null
  const toggleHidden = useCallback(
    () => model.edit({ hidden: !node.hidden }, [node.id]),
    [model, node],
  )
  const toggleLocked = useCallback(
    () => model.edit({ locked: !node.locked }, [node.id]),
    [model, node],
  )
  const openActions = useCallback(
    () => model.patch({ layerActionsId: node.id }),
    [model, node.id],
  )
  const menuButton = (
    <button
      className="icon-button layer-more"
      aria-label={t('Layer actions')}
      title={t('Layer actions')}
      data-layer-actions={node.id}
      onClick={model.compact ? openActions : undefined}
    >
      <MoreHorizontal size={15} />
    </button>
  )
  return (
    <div className="design-layer-controls">
      <button
        className={`icon-button layer-quick${node.hidden ? ' layer-state' : ''}`}
        disabled={readOnly}
        aria-label={t(node.hidden ? 'Show layer' : 'Hide layer')}
        title={t(node.hidden ? 'Show layer' : 'Hide layer')}
        onClick={toggleHidden}
      >
        {node.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <button
        className={`icon-button layer-quick${node.locked ? ' layer-state' : ''}`}
        disabled={readOnly}
        aria-label={t(node.locked ? 'Unlock layer' : 'Lock layer')}
        title={t(node.locked ? 'Unlock layer' : 'Lock layer')}
        onClick={toggleLocked}
      >
        {node.locked ? <Lock size={14} /> : <Unlock size={14} />}
      </button>
      {model.compact ? (
        menuButton
      ) : (
        <EditorActionMenu actions={actions} label={t('Layer actions')}>
          {menuButton}
        </EditorActionMenu>
      )}
    </div>
  )
}
