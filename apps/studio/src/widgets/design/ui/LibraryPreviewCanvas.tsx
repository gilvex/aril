import { useMemo } from 'react'
import { designPosition, isDesignContainer } from '@pomegranate/domain/design'
import type { DesignMiniPreviewProps } from '../types/designMiniPreviewProps.ts'
export function LibraryPreviewCanvas({ nodes }: DesignMiniPreviewProps) {
  const boxes = useMemo(
    () =>
      nodes
        .filter((n) => !n.hidden)
        .map((node) => ({ node, position: designPosition(nodes, node) }))
        .sort((a, b) => a.node.order - b.node.order),
    [nodes],
  )
  const x = Math.min(0, ...boxes.map((b) => b.position.x)),
    y = Math.min(0, ...boxes.map((b) => b.position.y))
  const left = boxes.length ? Math.min(...boxes.map((b) => b.position.x)) : x
  const top = boxes.length ? Math.min(...boxes.map((b) => b.position.y)) : y
  const width = Math.max(
    16,
    ...boxes.map((b) => b.position.x + b.node.width - left),
  )
  const height = Math.max(
    16,
    ...boxes.map((b) => b.position.y + b.node.height - top),
  )
  return (
    <svg
      className="asset-preview-canvas"
      viewBox={`${left - 8} ${top - 8} ${width + 16} ${height + 16}`}
      aria-hidden="true"
    >
      {boxes.map(({ node, position }) => (
        <foreignObject
          key={node.id}
          x={position.x}
          y={position.y}
          width={node.width}
          height={node.height}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              background: node.fill,
              border: `${node.strokeWidth}px solid ${node.stroke}`,
              borderRadius: node.kind === 'ellipse' ? '50%' : node.radius,
              color: node.color,
              fontSize: node.fontSize,
              fontWeight: node.fontWeight,
              fontFamily:
                node.fontFamily === 'System'
                  ? 'system-ui, sans-serif'
                  : `${node.fontFamily}, sans-serif`,
              textAlign: node.textAlign,
              display: 'grid',
              alignItems: 'center',
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
            }}
          >
            {isDesignContainer(node) ? null : node.kind === 'image' &&
              node.imageUrl ? (
              <img
                src={node.imageUrl}
                alt=""
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              node.text
            )}
          </div>
        </foreignObject>
      ))}
    </svg>
  )
}
