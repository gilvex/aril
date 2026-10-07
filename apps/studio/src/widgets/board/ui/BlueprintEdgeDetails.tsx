import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useBlueprintEdgeDetailsHandlers } from '../model/useBlueprintEdgeDetailsHandlers.tsx'

import { Link2, Unplug } from 'lucide-react'

import type { BlueprintEdgeDetailsProps } from '../types/blueprintEdgeDetailsProps.ts'
export function BlueprintEdgeDetails({
  board,
  edge,
  editField,
  update,
  setSelectedEdge,
}: BlueprintEdgeDetailsProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'

  const { handleConnectionLabelChange, handleClick } =
    useBlueprintEdgeDetailsHandlers({ update, board, edge, setSelectedEdge })
  return (
    <div className="inspector-body">
      <div className="detail-kind">
        <Link2 size={16} /> {t('Relationship')}
      </div>
      <h2>{board.nodes.find((n) => n.id === edge.source)?.data.title}</h2>
      <p className="muted">
        {t('connects to')}
        {board.nodes.find((n) => n.id === edge.target)?.data.title}
      </p>
      <label>
        {t('Connection label')}
        <input
          disabled={readOnly}
          aria-label={t('Connection label')}
          ref={editField}
          value={edge.label || ''}
          maxLength={120}
          onChange={handleConnectionLabelChange}
        />
      </label>
      <button
        disabled={readOnly}
        className="button danger"
        onClick={handleClick}
      >
        <Unplug size={15} />
        {t('Remove connection')}
      </button>
    </div>
  )
}
