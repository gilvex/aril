import { useCallback, type MouseEvent } from 'react'
import { Background, Controls, ReactFlow } from '@xyflow/react'
import { Plus, LayoutTemplate } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { useDesignDocument } from '../model/useDesignDocument.ts'
import { useDesignCanvas } from '../model/useDesignCanvas.ts'
import { useDesignCanvasLabels } from '../model/useDesignCanvasLabels.ts'
import { DesignElementNode } from './DesignElementNode.tsx'
import { DesignToolbar } from './DesignToolbar.tsx'
import { DesignLayers } from './DesignLayers.tsx'
import { DesignInspector } from './DesignInspector.tsx'
import { DesignSettings } from './DesignSettings.tsx'
import { DesignCursors } from './DesignCursors.tsx'
import type { DesignBoardProps } from '../types/designBoardProps.ts'
import type { DesignFlowNode } from '../types/designFlowNode.ts'
const nodeTypes = { designElement: DesignElementNode }
export function DesignCanvas(props: DesignBoardProps) {
  const { t } = useTranslation()
  const labels = useDesignCanvasLabels()
  const compact = useCompactLayout()
  const model = useDesignDocument(props)
  const canvas = useDesignCanvas(model, props)
  const doubleClick = useCallback(
    (_event: MouseEvent, node: DesignFlowNode) => {
      model.patch({
        selection: [node.id],
        inspector: true,
        styles: false,
        editingId: ['text', 'button'].includes(node.data.element.kind)
          ? node.id
          : null,
      })
    },
    [model],
  )
  const showDetails = useCallback(
    (_event: MouseEvent, node: DesignFlowNode) => {
      if (!compact) model.patch({ inspector: true, styles: false })
      if (model.editingId !== node.id) model.patch({ editingId: null })
    },
    [compact, model],
  )
  const clear = useCallback(
    () => model.patch({ selection: [], editingId: null }),
    [model],
  )
  return (
    <section
      className="design-editor"
      aria-label={t('Design canvas')}
      onKeyDown={canvas.keyboard}
    >
      {model.layers && <DesignLayers model={model} />}
      <div
        ref={canvas.surface}
        className="design-canvas-surface"
        onPointerMove={canvas.moveCursor}
        onPointerLeave={() => props.sendPresence({ cursor: null })}
      >
        <ReactFlow<DesignFlowNode>
          ariaLabelConfig={labels}
          nodes={canvas.nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          onNodesChange={canvas.onNodesChange}
          onNodeDoubleClick={doubleClick}
          onNodeClick={showDetails}
          onPaneClick={clear}
          onMove={canvas.moveCamera}
          nodesConnectable={false}
          nodesDraggable={model.tool === 'select'}
          panOnDrag={model.tool === 'pan' || compact ? true : [1, 2]}
          selectionOnDrag={!compact && model.tool === 'select'}
          selectionKeyCode="Shift"
          multiSelectionKeyCode={['Control', 'Meta']}
          deleteKeyCode={null}
          zoomOnDoubleClick={false}
          minZoom={0.1}
          maxZoom={2}
          fitView
          fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
          elevateNodesOnSelect={false}
        >
          <Background gap={20} size={1} color="var(--canvas-dot, #e2dae9)" />
          <Controls showInteractive={false} />
          <DesignCursors peers={canvas.peers} />
        </ReactFlow>
        <DesignToolbar
          model={model}
          add={canvas.add}
          insertTemplate={canvas.insertTemplate}
        />
        {!model.page.nodes.length && (
          <div className="design-empty">
            <h2>{t('Start a design')}</h2>
            <button
              className="button primary"
              onClick={() => canvas.add('frame')}
            >
              <Plus size={16} />
              {t('Add a frame')}
            </button>
            <button className="button" onClick={canvas.insertTemplate}>
              <LayoutTemplate size={16} />
              {t('Use editable template')}
            </button>
          </div>
        )}
      </div>
      {model.inspector &&
        (model.styles ? (
          <DesignSettings
            design={props.design}
            update={props.update}
            colors={['#b34568', '#7955ad', '#386a92', '#307568', '#9c603a']}
            close={() => model.patch({ inspector: false })}
          />
        ) : (
          <DesignInspector model={model} />
        ))}
    </section>
  )
}
