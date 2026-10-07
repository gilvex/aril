import { useDesignDoubleClick } from '../model/useDesignDoubleClick.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useCallback, type MouseEvent } from 'react'
import { Background, Controls, ReactFlow } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { EditorContextMenu } from '@/shared/ui/index.tsx'
import { useDesignContextMenu } from '../model/useDesignContextMenu.ts'
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
  const role = useWorkspaceRole()
  const canEdit = role !== 'viewer' && role !== null
  const { t } = useTranslation()
  const labels = useDesignCanvasLabels()
  const compact = useCompactLayout()
  const model = useDesignDocument(props)
  const canvas = useDesignCanvas(model, props)
  const context = useDesignContextMenu(model)
  const doubleClick = useDesignDoubleClick(model, canEdit)
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
      className={
        'design-editor design-floating-tools' +
        (props.navigation ? ' has-board-navigation' : '')
      }
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
        <EditorContextMenu
          actions={context.actions}
          label={t('Canvas actions')}
          disabled={!canEdit || !!model.editingId}
        >
          <div
            className="design-flow-context"
            onContextMenuCapture={context.prepare}
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
              nodesDraggable={canEdit && model.tool === 'select'}
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
              <Background
                gap={20}
                size={1}
                color="var(--canvas-dot, #e2dae9)"
              />
              <Controls showInteractive={false} />
              <DesignCursors peers={canvas.peers} />
            </ReactFlow>
          </div>
        </EditorContextMenu>
        <DesignToolbar
          navigation={props.navigation}
          model={model}
          add={canvas.add}
          insertTemplate={canvas.insertTemplate}
        />
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
