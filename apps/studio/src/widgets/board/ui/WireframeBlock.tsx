import { Text } from '@/shared/ui/Text.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWireframeBlockHandlers } from '../model/useWireframeBlockHandlers.tsx'

import type { WireFlowNode } from '@/widgets/board/types/wireFlowNode.ts'
import {
  Handle,
  NodeResizer,
  Position,
  useUpdateNodeInternals,
  type NodeProps,
} from '@xyflow/react'
import { Image, Menu, MoreHorizontal } from 'lucide-react'
import { useEffect } from 'react'

export function WireframeBlock({
  id,
  data,
  selected,
}: NodeProps<WireFlowNode>) {
  const readOnly = useWorkspaceRole() === 'viewer'
  const { t } = useTranslation()

  const updateNodeInternals = useUpdateNodeInternals()
  useEffect(() => {
    updateNodeInternals(id)
  }, [id, data.preview, updateNodeInternals])

  const { handleClick } = useWireframeBlockHandlers({ data })
  return (
    <>
      <NodeResizer
        isVisible={!readOnly && selected && !data.preview}
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
          aria-label={t('Connect on left of {{title}}', { title: data.title })}
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
            <Text as="span" className="wire-window-dots">
              <i />
              <i />
              <i />
            </Text>
            <Text as="span">{data.title}</Text>
            <MoreHorizontal size={15} />
          </div>
        ) : data.kind === 'image' ? (
          <>
            <Image size={32} strokeWidth={1.2} />
            <Text as="span">{data.title}</Text>
          </>
        ) : data.kind === 'navigation' ? (
          <>
            <Menu size={18} />
            <Text as="strong">{data.title}</Text>
            <Text as="span">
              {data.content || 'Overview     Activity     Settings'}
            </Text>
            <span className="wire-avatar-dot" />
          </>
        ) : data.kind === 'input' ? (
          <>
            <Text as="span" className="wire-input-label">
              {data.title}
            </Text>
            <Text as="span" className="wire-input-placeholder">
              {data.content || 'Placeholder…'}
            </Text>
          </>
        ) : (
          <>
            <Text as="strong">{data.title}</Text>
            {data.content && data.kind !== 'button' && (
              <Text as="p">{data.content}</Text>
            )}
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
            aria-label={t('Follow {{title}}', { title: data.title })}
            onClick={handleClick}
          />
        )}
      </div>
      {!data.preview && (
        <Handle
          id="right"
          type="source"
          position={Position.Right}
          aria-label={t('Connect on right of {{title}}', { title: data.title })}
        />
      )}
    </>
  )
}
