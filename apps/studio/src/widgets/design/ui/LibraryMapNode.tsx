import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Component, Variable, Workflow, File, ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryMapNode as MapNode } from '../types/libraryMapNode.ts'
const icons = {
  component: Component,
  variable: Variable,
  machine: Workflow,
  page: File,
  cluster: Component,
}
export function LibraryMapNode({ data }: NodeProps<MapNode>) {
  const { t } = useTranslation()
  const Icon = icons[data.kind]
  const cluster = data.kind === 'cluster'
  return (
    <div
      className={`library-map-node ${cluster ? 'is-cluster' : ''}`}
      data-external={data.external || undefined}
      style={{ '--cluster-color': data.color } as CSSProperties}
      title={data.label}
    >
      <Handle type="target" position={Position.Left} />
      {cluster ? (
        <svg
          className="library-constellation"
          viewBox="0 0 160 100"
          aria-hidden="true"
        >
          {Array.from({ length: Math.min(36, data.count) }, (_, i) => {
            const radius = Math.sqrt(i + 1) * 7
            const x = 80 + Math.cos(i * 2.399963) * radius * 1.4,
              y = 50 + Math.sin(i * 2.399963) * radius
            return (
              <g key={i}>
                <path d={`M80 50L${x} ${y}`} />
                <circle cx={x} cy={y} r={i % 7 === 0 ? 3.5 : 2} />
              </g>
            )
          })}
          <circle cx="80" cy="50" r="6" />
        </svg>
      ) : (
        <span className={`library-map-symbol kind-${data.kind}`}>
          {data.icon || <Icon size={18} />}
        </span>
      )}
      <strong>{data.label}</strong>
      <small>
        {t(
          cluster
            ? data.external
              ? '{{count}} connections'
              : '{{count}} assets'
            : '{{count}} uses',
          { count: data.count },
        )}
      </small>
      {cluster && <ArrowUpRight className="library-cluster-expand" size={14} />}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
