import { Text } from '@/shared/ui/Text.tsx'
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
        <Link2 size={16} /> <Text>{t('Relationship')}</Text>
      </div>
      <Text as="h2">
        {board.nodes.find((n) => n.id === edge.source)?.data.title}
      </Text>
      <Text as="p" className="muted">
        {t('Connects to {{name}}', {
          name: board.nodes.find((n) => n.id === edge.target)?.data.title || '',
        })}
      </Text>
      <Text as="label">
        {t('Connection label')}
        <input
          disabled={readOnly}
          aria-label={t('Connection label')}
          ref={editField}
          value={edge.label || ''}
          maxLength={120}
          onChange={handleConnectionLabelChange}
        />
      </Text>
      <button
        disabled={readOnly}
        className="button danger"
        onClick={handleClick}
      >
        <Unplug size={15} />
        <Text>{t('Remove connection')}</Text>
      </button>
    </div>
  )
}
