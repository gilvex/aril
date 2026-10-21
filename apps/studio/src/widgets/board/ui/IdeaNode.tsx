import { Text } from '@/shared/ui/Text.tsx'
import { nodeIconOptions } from '../config/nodeIconOptions.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { kindIcons } from '@/widgets/board/config/kindIcons.ts'
import { kindLabels } from '@/widgets/board/config/kindLabels.ts'
import type { Idea } from '@aril/domain/workspace'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { Link2 } from 'lucide-react'
import { memo } from 'react'
export const IdeaNode = memo(function IdeaNode({
  data,
  selected,
}: NodeProps<Node<Idea['data']>>) {
  const { t } = useTranslation()
  const Icon = data.icon
    ? nodeIconOptions[data.icon].icon
    : kindIcons[data.kind]
  return (
    <div
      className={`idea-node kind-${data.kind} ${selected ? 'is-selected' : ''}`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="node-heading">
        {data.kind === 'block' && (
          <Text as="span" className="node-icon">
            <Icon size={19} strokeWidth={1.8} />
          </Text>
        )}
        <Text as="span" className="node-kind">
          {t(kindLabels[data.kind])}
        </Text>
        <span
          className={`status-dot ${data.status.toLowerCase()}`}
          title={t(data.status)}
        />
      </div>
      <div className="node-title"><Text>{data.title}</Text></div>
      <Text as="p">{data.description}</Text>
      <div className="node-footer">
        <Text as="span">{t(data.status)}</Text>
        <Text as="span">
          <Link2 size={12} />
          {t('linkedCount', { count: data.requirements.length })}
        </Text>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
})
