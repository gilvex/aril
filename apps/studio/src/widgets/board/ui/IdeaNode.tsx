import type { Idea } from '@pomegranate/domain/workspace'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { Link2 } from 'lucide-react'
import { memo } from 'react'
import { kindIcons } from '../config/kindIcons.ts'
import { kindLabels } from '../config/kindLabels.ts'
export const IdeaNode = memo(function IdeaNode({
  data,
  selected,
}: NodeProps<Node<Idea['data']>>) {
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
        <span className="node-kind">{kindLabels[data.kind]}</span>
        <span
          className={`status-dot ${data.status.toLowerCase()}`}
          title={data.status}
        />
      </div>
      <div className="node-title">{data.title}</div>
      <p>{data.description}</p>
      <div className="node-footer">
        <span>{data.status}</span>
        <span>
          <Link2 size={12} />
          {data.requirements.length} linked
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
})
