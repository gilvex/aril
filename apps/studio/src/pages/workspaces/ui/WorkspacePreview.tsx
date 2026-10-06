import { memo, useMemo } from 'react'
import { Workflow } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { StudioOverview } from '@pomegranate/domain/studios'
import { previewViewBox } from '../utils/previewViewBox.ts'

export const WorkspacePreview = memo(function WorkspacePreview({
  studio,
}: {
  studio: StudioOverview
}) {
  const { t } = useTranslation()
  const nodes = studio.nodes
  const index = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  )
  const viewBox = useMemo(
    () => (nodes.length ? previewViewBox(nodes) : ''),
    [nodes],
  )
  return (
    <div className="workspace-preview" aria-hidden="true">
      {nodes.length ? (
        <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
          {studio.edges.map((edge, i) => {
            const from = index.get(edge.source),
              to = index.get(edge.target)
            if (!from || !to) return null
            const right = to.x >= from.x
            const x1 = from.x + (right ? 240 : 0),
              x2 = to.x + (right ? 0 : 240)
            const middle = (x1 + x2) / 2
            return (
              <path
                key={i}
                className="workspace-preview-edge"
                d={`M${x1} ${from.y + 55} H${middle} V${to.y + 55} H${x2}`}
              />
            )
          })}
          {nodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              className={`workspace-preview-node preview-${node.kind}`}
            >
              <rect width="240" height="110" rx="10" />
              <text x="120" y="61" textAnchor="middle">
                {node.title.length > 24
                  ? `${node.title.slice(0, 23)}…`
                  : node.title}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <div className="workspace-preview-empty">
          <Workflow size={28} />
          <span>{t('Ready for your first ideas')}</span>
        </div>
      )}
    </div>
  )
})
