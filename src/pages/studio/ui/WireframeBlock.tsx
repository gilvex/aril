import {
  Handle,
  NodeResizer,
  Position,
  useUpdateNodeInternals,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import { useEffect } from 'react'
import { Image, Menu, MoreHorizontal } from 'lucide-react'
import type { WireNode } from '../../../../domain/wireframe'

export type WireFlowNode = Node<
  WireNode['data'] & {
    preview: boolean
    checkpoint: () => void
    follow?: () => void
    selectorColor?: string
  },
  'wireframe'
>

export function WireframeBlock({
  id,
  data,
  selected,
}: NodeProps<WireFlowNode>) {
  const updateNodeInternals = useUpdateNodeInternals()
  useEffect(() => {
    updateNodeInternals(id)
  }, [id, data.preview, updateNodeInternals])
  return (
    <>
      <NodeResizer
        isVisible={selected && !data.preview}
        minWidth={60}
        minHeight={32}
        maxWidth={2400}
        maxHeight={2400}
        onResizeStart={data.checkpoint}
        color="#a34d6c"
      />
      {!data.preview && (
        <Handle
          id="left"
          type="source"
          position={Position.Left}
          aria-label={`Connect on left of ${data.title}`}
        />
      )}
      <div
        className={`wire-block wire-${data.kind} wire-tone-${data.tone}${data.preview ? ' is-preview' : ''}`}
        style={
          data.selectorColor
            ? { outline: `2px solid ${data.selectorColor}` }
            : undefined
        }
      >
        {data.kind === 'screen' ? (
          <div className="wire-screen-title">
            <span className="wire-window-dots">
              <i />
              <i />
              <i />
            </span>
            <span>{data.title}</span>
            <MoreHorizontal size={15} />
          </div>
        ) : data.kind === 'image' ? (
          <>
            <Image size={32} strokeWidth={1.2} />
            <span>{data.title}</span>
          </>
        ) : data.kind === 'navigation' ? (
          <>
            <Menu size={18} />
            <strong>{data.title}</strong>
            <span>{data.content || 'Overview     Activity     Settings'}</span>
            <span className="wire-avatar-dot" />
          </>
        ) : data.kind === 'input' ? (
          <>
            <span className="wire-input-label">{data.title}</span>
            <span className="wire-input-placeholder">
              {data.content || 'Placeholder…'}
            </span>
          </>
        ) : (
          <>
            <strong>{data.title}</strong>
            {data.content && data.kind !== 'button' && <p>{data.content}</p>}
            {data.kind === 'card' && !data.content && (
              <div className="wire-skeleton">
                <i />
                <i />
                <i />
              </div>
            )}
          </>
        )}
        {data.preview && data.follow && (
          <button
            className="wire-hotspot nodrag nopan"
            aria-label={`Follow ${data.title}`}
            onClick={(event) => {
              event.stopPropagation()
              data.follow?.()
            }}
          />
        )}
      </div>
      {!data.preview && (
        <Handle
          id="right"
          type="source"
          position={Position.Right}
          aria-label={`Connect on right of ${data.title}`}
        />
      )}
    </>
  )
}
