import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { designLayerIcons } from '../config/designTools.ts'
import type { DesignLayerRowProps } from '../types/designLayerRowProps.ts'
export function DesignLayerRow({ node, model }: DesignLayerRowProps) {
  const { t } = useTranslation()
  const Icon = designLayerIcons[node.kind]
  const flow = useReactFlow()
  const focusLayer = useCallback(() => {
    void flow.fitView({
      nodes: [{ id: node.id }],
      padding: 0.3,
      maxZoom: 1.5,
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : 180,
    })
  }, [flow, node.id])
  const toggleFrame = useCallback(() => {
    model.patch({
      collapsed: model.collapsed.includes(node.id)
        ? model.collapsed.filter((id) => id !== node.id)
        : [...model.collapsed, node.id],
    })
  }, [model, node.id])
  return (
    <div
      className={`design-layer-row${model.selection.includes(node.id) ? ' selected' : ''}${node.parentId ? ' child' : ''}${node.hidden ? ' hidden' : ''}`}
    >
      {node.kind === 'frame' && (
        <button
          className="icon-button"
          aria-label={t(
            model.collapsed.includes(node.id)
              ? 'Expand frame layers'
              : 'Collapse frame layers',
          )}
          aria-expanded={!model.collapsed.includes(node.id)}
          onClick={toggleFrame}
        >
          {model.collapsed.includes(node.id) ? (
            <ChevronRight size={13} />
          ) : (
            <ChevronDown size={13} />
          )}
        </button>
      )}
      <button
        className="design-layer-select"
        onDoubleClick={focusLayer}
        onClick={(event) =>
          model.select(
            node.id,
            event.ctrlKey || event.metaKey || event.shiftKey,
          )
        }
        aria-pressed={model.selection.includes(node.id)}
        title={node.name}
      >
        <Icon size={15} />
        <span>{node.name}</span>
      </button>
      <button
        className="icon-button"
        aria-label={t(node.hidden ? 'Show layer' : 'Hide layer')}
        title={t(node.hidden ? 'Show layer' : 'Hide layer')}
        onClick={() => model.edit({ hidden: !node.hidden }, [node.id])}
      >
        {node.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
      <button
        className="icon-button"
        aria-label={t(node.locked ? 'Unlock layer' : 'Lock layer')}
        title={t(node.locked ? 'Unlock layer' : 'Lock layer')}
        onClick={() => model.edit({ locked: !node.locked }, [node.id])}
      >
        {node.locked ? <Lock size={13} /> : <Unlock size={13} />}
      </button>
    </div>
  )
}
