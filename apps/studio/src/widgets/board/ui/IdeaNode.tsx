import { useTranslation } from '@/shared/i18n/index.ts'
import { kindIcons } from '@/widgets/board/config/kindIcons.ts'
import { kindLabels } from '@/widgets/board/config/kindLabels.ts'
import type { Idea } from '@pomegranate/domain/workspace'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { Link2 } from 'lucide-react'
import { memo } from 'react'
export const IdeaNode = memo(function IdeaNode({
  data,
  selected,
}: NodeProps<Node<Idea['data']>>) {
  const { t } = useTranslation()
  const Icon = kindIcons[data.kind]
  return (
    <div
      className={`idea-node kind-${data.kind} ${selected ? 'is-selected' : ''}`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="node-heading">
        <span className="node-icon">
          <Icon size={19} strokeWidth={1.8} />
        </span>
        <span className="node-kind">{t(kindLabels[data.kind])}</span>
        <span
          className={`status-dot ${data.status.toLowerCase()}`}
          title={t(data.status)}
        />
      </div>
      <div className="node-title">{data.title}</div>
      <p>{data.description}</p>
      <div className="node-footer">
        <span>{t(data.status)}</span>
        <span>
          <Link2 size={12} />
          {t('linkedCount', { count: data.requirements.length })}
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
})
