import { Text } from '@/shared/ui/Text.tsx'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWireframeEdgeDetailsHandlers } from '../model/useWireframeEdgeDetailsHandlers.tsx'

import { ArrowRight, Trash2 } from 'lucide-react'

import type { WireframeEdgeDetailsProps } from '../types/wireframeEdgeDetailsProps.ts'
export function WireframeEdgeDetails({
  graph,
  edge,
  editField,
  save,
  focus,
  setEdgeId,
}: WireframeEdgeDetailsProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'

  const {
    handleInteractionLabelChange,
    handleInteractionDestinationChange,
    handleClick,
  } = useWireframeEdgeDetailsHandlers({ save, graph, edge, setEdgeId })
  return (
    <div className="inspector-body">
      <div className="detail-kind">
        <ArrowRight size={16} />
        <Text>{t('Interaction')}</Text>
      </div>
      <Text as="h2">
        {graph.nodes.find((n) => n.id === edge.source)?.data.title}
      </Text>
      <Text as="p">
        {t('leads to')}
        {graph.nodes.find((n) => n.id === edge.target)?.data.title}
      </Text>
      <Text as="label">
        {t('Interaction label')}
        <input
          disabled={readOnly}
          aria-label={t('Interaction label')}
          ref={editField}
          value={edge.label}
          maxLength={120}
          onChange={handleInteractionLabelChange}
        />
      </Text>
      <Text as="label">
        {t('Destination')}
        <StudioSelect
          disabled={readOnly}
          aria-label={t('Interaction destination')}
          value={edge.target}
          onChange={handleInteractionDestinationChange}
        >
          {graph.nodes
            .filter((n) => n.id !== edge.source)
            .map((n) => (
              <option key={n.id} value={n.id}>
                {n.data.title}
              </option>
            ))}
        </StudioSelect>
      </Text>
      <button
        disabled={readOnly}
        className="button"
        onClick={() => focus(edge.target)}
      >
        <ArrowRight size={14} />
        <Text>{t('Show destination')}</Text>
      </button>
      <button
        disabled={readOnly}
        className="button danger"
        onClick={handleClick}
      >
        <Trash2 size={14} />
        <Text>{t('Remove flow')}</Text>
      </button>
    </div>
  )
}
