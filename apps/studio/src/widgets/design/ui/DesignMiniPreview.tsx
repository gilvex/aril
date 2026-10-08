import { designPosition, isDesignContainer } from '@pomegranate/domain/design'
import type { DesignMiniPreviewProps } from '../types/designMiniPreviewProps.ts'
export function DesignMiniPreview({ nodes }: DesignMiniPreviewProps) {
  const positions = nodes.map((node) => ({
    node,
    position: designPosition(nodes, node),
  }))
  const width = Math.max(
      16,
      ...positions.map((p) => p.position.x + p.node.width),
    ),
    height = Math.max(16, ...positions.map((p) => p.position.y + p.node.height))
  const scale = Math.min(1, 320 / width, 150 / height)
  return (
    <div
      className="design-mini-preview"
      style={{ height: Math.max(60, height * scale) }}
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {positions
          .filter(({ node }) => !node.hidden)
          .map(({ node, position }) => (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                width: node.width,
                height: node.height,
                background: node.fill,
                border: `${node.strokeWidth}px solid ${node.stroke}`,
                borderRadius: node.kind === 'ellipse' ? '50%' : node.radius,
                color: node.color,
                fontSize: node.fontSize,
                fontWeight: node.fontWeight,
                textAlign: node.textAlign,
                display: 'grid',
                alignItems: 'center',
                whiteSpace: 'pre-wrap',
              }}
            >
              {isDesignContainer(node) ? null : node.kind === 'image' &&
                node.imageUrl ? (
                <img
                  src={node.imageUrl}
                  alt={node.name}
                  referrerPolicy="no-referrer"
                />
              ) : (
                node.text
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
