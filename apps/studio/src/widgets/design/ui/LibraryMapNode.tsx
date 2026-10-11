import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Variable, File, Layers, ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryMapNode as MapNode } from '../types/libraryMapNode.ts'
import { ComponentGlyph } from './ComponentGlyph.tsx'
export function LibraryMapNode({ data }: NodeProps<MapNode>) {
  const { t } = useTranslation()
  const cluster = data.kind === 'cluster'
  const Icon = cluster ? Layers : data.kind === 'variable' ? Variable : File
  return (
    <div
      className={`library-map-node ${cluster ? 'is-cluster' : ''}`}
      data-external={data.external || undefined}
      style={{ '--cluster-color': data.color } as CSSProperties}
      title={data.label}
    >
      <Handle type="target" position={Position.Left} />
      <span className={`library-map-symbol kind-${data.kind}`}>
        {data.kind === 'component' ? (
          <ComponentGlyph glyph={data.glyph} icon={data.icon} />
        ) : (
          <Icon size={22} />
        )}
        {cluster && (
          <ArrowUpRight className="library-cluster-expand" size={12} />
        )}
      </span>
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
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
