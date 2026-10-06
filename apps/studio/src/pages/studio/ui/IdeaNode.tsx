import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import {
  Layers3,
  Boxes,
  Database,
  Box,
  UserRound,
  StickyNote,
  Link2,
} from 'lucide-react'
import type { Idea } from '../../../shared/api/workspace'
export const kindLabels = {
  layer: 'Reusable layer',
  service: 'Service',
  database: 'Data & history',
  instance: 'Instance',
  person: 'User / team',
  note: 'Decision',
}
export const kindIcons = {
  layer: Layers3,
  service: Boxes,
  database: Database,
  instance: Box,
  person: UserRound,
  note: StickyNote,
}
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
