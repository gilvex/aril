import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useBlueprintFlowHandlers } from '../model/useBlueprintFlowHandlers.tsx'
import { useCanvasLabels } from '../model/useCanvasLabels.ts'

import { edgeTypes } from '@/widgets/board/config/canvasBoardEdgeTypes.ts'
import { nodeTypes } from '@/widgets/board/config/canvasBoardNodeTypes.ts'
import { LiveCursors } from '@/widgets/board/ui/LiveCursors.tsx'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
} from '@xyflow/react'

import type { BlueprintFlowProps } from '../types/blueprintFlowProps.ts'
export function BlueprintFlow(props: BlueprintFlowProps) {
  const role = useWorkspaceRole()
  const canEdit = role !== 'viewer' && role !== null
  const ariaLabelConfig = useCanvasLabels()
  const {
    board,
    liveNodes,
    selectedIds,
    profile,
    peers,
    setFlow,
    publishCamera,
    setInsertPoint,
    onNodesChange,
    tool,
    compact,
    touchSelection,
    onDelete,
    onConnect,
    checkpoint,
  } = props

  const {
    nodes,
    edges,
    handlePaneContextMenu,
    handleNodeClick,
    handleNodeDoubleClick,
    handleEdgeDoubleClick,
    handleEdgeClick,
    handlePaneClick,
    handleBeforeDelete,
    handleMoveEnd,
  } = useBlueprintFlowHandlers(props)
  return (
    <ReactFlow
      ariaLabelConfig={ariaLabelConfig}
      key={board.id}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onInit={setFlow}
      onMove={(_, viewport) => publishCamera(viewport)}
      onPaneContextMenu={handlePaneContextMenu}
      onMoveStart={() => setInsertPoint(null)}
      onNodesChange={onNodesChange}
      nodesDraggable={
        canEdit && tool === 'select' && (!compact || !touchSelection)
      }
      nodesConnectable={canEdit && tool !== 'pan'}
      panOnDrag={tool === 'pan' || compact ? true : [1, 2]}
      selectionOnDrag={!compact && tool === 'select'}
      zoomOnDoubleClick={false}
      onDelete={onDelete}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onEdgeDoubleClick={handleEdgeDoubleClick}
      onEdgeClick={handleEdgeClick}
      onPaneClick={handlePaneClick}
      onNodeDragStart={checkpoint}
      onSelectionDragStart={checkpoint}
      multiSelectionKeyCode={['Control', 'Meta']}
      selectionKeyCode="Shift"
      onBeforeDelete={handleBeforeDelete}
      onMoveEnd={handleMoveEnd}
      defaultViewport={board.viewport}
      fitView={compact || !board.viewport}
      fitViewOptions={{ padding: 0.16, maxZoom: 1 }}
      minZoom={0.2}
      maxZoom={2}
      deleteKeyCode={canEdit ? ['Backspace', 'Delete'] : null}
      defaultEdgeOptions={{ type: 'smoothstep' }}
      connectionRadius={28}
    >
      <StableCanvasViewport following={!!props.following} />
      <Background
        color="var(--canvas-dot, #d9d6e2)"
        gap={22}
        size={1.2}
        variant={BackgroundVariant.Dots}
      />
      <LiveCursors
        peers={peers}
        nodes={liveNodes}
        profile={profile}
        selectedIds={selectedIds}
      />
      <Controls showInteractive={false} />
      <MiniMap
        style={{ width: 160, height: 104 }}
        pannable
        zoomable
        nodeColor="var(--minimap-node, #c5bbd5)"
        maskColor="var(--minimap-mask, rgba(246,245,249,.65))"
      />
    </ReactFlow>
  )
}
import { StableCanvasViewport } from '@/shared/ui/index.tsx'
