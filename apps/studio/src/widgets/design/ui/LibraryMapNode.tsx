import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Variable, File, Layers, Plus, Minus } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { useCallback, type MouseEvent } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryMapNode as MapNode } from '../types/libraryMapNode.ts'
import { ComponentGlyph } from './ComponentGlyph.tsx'
export function LibraryMapNode({ data }: NodeProps<MapNode>) {
  const { t } = useTranslation()
  const cluster = data.kind === 'cluster'
  const { toggle: toggleGroup } = data
  const toggle = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      toggleGroup?.()
    },
    [toggleGroup],
  )
  if (data.kind === 'more')
    return (
      <Button
        className="nodrag nopan library-map-more"
        variant="outline"
        onClick={toggle}
      >
        {t('Show more')} · {data.count}
      </Button>
    )
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
          <Button
            className="nodrag nopan library-cluster-expand"
            variant="ghost"
            size="icon"
            aria-label={t(
              data.expanded ? 'Collapse {{name}}' : 'Expand {{name}}',
              { name: data.label },
            )}
            aria-expanded={!!data.expanded}
            onClick={toggle}
          >
            {data.expanded ? <Minus size={12} /> : <Plus size={12} />}
          </Button>
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
