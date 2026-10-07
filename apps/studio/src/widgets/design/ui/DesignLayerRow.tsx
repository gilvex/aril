import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Scan,
} from 'lucide-react'
import { isDesignContainer } from '@pomegranate/domain/design'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { EditorContextMenu, EditorActionMenu } from '@/shared/ui/index.tsx'
import { useDesignLayerActions } from '../model/useDesignLayerActions.ts'
import { designLayerIcons } from '../config/designTools.ts'
import type { DesignLayerRowProps } from '../types/designLayerRowProps.ts'
export function DesignLayerRow({ node, model, depth }: DesignLayerRowProps) {
  const { t } = useTranslation()
  const Icon = node.maskId ? Scan : designLayerIcons[node.kind]
  const flow = useReactFlow()
  const actions = useDesignLayerActions(model, node.id)
  const prepareMenu = useCallback(() => {
    model.patch({
      selection: model.selection.includes(node.id)
        ? model.selection
        : [node.id],
    })
  }, [model, node.id])
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
    <EditorContextMenu actions={actions} label={t('Layer actions')}>
      <div
        onContextMenuCapture={prepareMenu}
        style={{ paddingLeft: 6 + depth * 14 }}
        className={`design-layer-row${model.selection.includes(node.id) ? ' selected' : ''}${node.parentId ? ' child' : ''}${node.hidden ? ' hidden' : ''}`}
      >
        {isDesignContainer(node) && (
          <button
            className="icon-button"
            aria-label={t(
              model.collapsed.includes(node.id)
                ? 'Expand child layers'
                : 'Collapse child layers',
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
        <EditorActionMenu actions={actions} label={t('Layer actions')}>
          <button
            className="icon-button layer-more"
            aria-label={t('Layer actions')}
          >
            <MoreHorizontal size={13} />
          </button>
        </EditorActionMenu>
      </div>
    </EditorContextMenu>
  )
}
