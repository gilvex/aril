import { ChevronDown, ChevronRight, Scan } from 'lucide-react'
import { isDesignContainer } from '@pomegranate/domain/design'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback, type MouseEvent } from 'react'
import { useReactFlow } from '@xyflow/react'
import { EditorContextMenu } from '@/shared/ui/index.tsx'
import { useDesignLayerActions } from '../model/useDesignLayerActions.ts'
import { designLayerIcons } from '../config/designTools.ts'
import type { DesignLayerRowProps } from '../types/designLayerRowProps.ts'
import { DesignLayerControls } from './DesignLayerControls.tsx'
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
  const selectLayer = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      model.select(node.id, event.ctrlKey || event.metaKey || event.shiftKey)
    },
    [model, node.id],
  )
  return (
    <EditorContextMenu actions={actions} label={t('Layer actions')}>
      <div
        onContextMenuCapture={prepareMenu}
        className={`design-layer-row${model.selection.includes(node.id) ? ' selected' : ''}${node.parentId ? ' child' : ''}${node.hidden ? ' hidden' : ''}`}
      >
        <div
          className="design-layer-content"
          style={{ paddingLeft: 6 + depth * 12 }}
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
            onClick={selectLayer}
            aria-pressed={model.selection.includes(node.id)}
            title={node.name}
          >
            <Icon size={15} />
            <span>{node.name}</span>
          </button>
        </div>
        <DesignLayerControls node={node} model={model} actions={actions} />
      </div>
    </EditorContextMenu>
  )
}
