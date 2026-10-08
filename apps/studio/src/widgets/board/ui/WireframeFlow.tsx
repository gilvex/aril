import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { edgeTypes } from '@/widgets/board/config/wireframeBoardEdgeTypes.ts'
import { nodeTypes } from '@/widgets/board/config/wireframeBoardNodeTypes.ts'
import type { WireFlowNode } from '@/widgets/board/types/wireFlowNode.ts'
import { LiveCursors } from '@/widgets/board/ui/LiveCursors.tsx'
import {
  Background,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
} from '@xyflow/react'
import { useWireframeFlowHandlers } from '../model/useWireframeFlowHandlers.tsx'
import { useCanvasLabels } from '../model/useCanvasLabels.ts'

import type { WireframeFlowProps } from '../types/wireframeFlowProps.ts'
export function WireframeFlow(props: WireframeFlowProps) {
  const role = useWorkspaceRole()
  const canEdit = role !== 'viewer' && role !== null
  const ariaLabelConfig = useCanvasLabels()
  const {
    selection,
    profile,
    peers,
    preview,
    setFlow,
    publishCamera,
    openInsertMenu,
    setInsertPoint,
    onNodesChange,
    tool,
    compact,
    touchSelection,
    connect,
    checkpoint,
    board,
    following,
    update,
  } = props

  const {
    nodes,
    edges,
    handleNodeClick,
    handleNodeDoubleClick,
    handleEdgeDoubleClick,
    handleEdgeClick,
    handlePaneClick,
    handleDelete,
    cursorNodes,
    getNodeColor,
  } = useWireframeFlowHandlers(props)
  return (
    <ReactFlow<WireFlowNode>
      ariaLabelConfig={ariaLabelConfig}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionMode={ConnectionMode.Loose}
      onInit={setFlow}
      onMove={(_, viewport) => publishCamera(viewport)}
      onPaneContextMenu={(event) => openInsertMenu(event)}
      onNodeContextMenu={(event, target) => openInsertMenu(event, target)}
      onMoveStart={() => setInsertPoint(null)}
      onNodesChange={onNodesChange}
      nodesDraggable={
        canEdit &&
        !preview &&
        tool === 'select' &&
        (!compact || !touchSelection)
      }
      panOnDrag={tool === 'pan' || compact || preview ? true : [1, 2]}
      selectionOnDrag={!compact && !preview && tool === 'select'}
      zoomOnDoubleClick={false}
      nodesConnectable={canEdit && !preview && tool !== 'pan'}
      deleteKeyCode={!canEdit || preview ? null : ['Backspace', 'Delete']}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onEdgeDoubleClick={handleEdgeDoubleClick}
      onEdgeClick={handleEdgeClick}
      onPaneClick={handlePaneClick}
      onConnect={(connection) => connect(connection.source, connection.target)}
      onNodeDragStart={checkpoint}
      onSelectionDragStart={checkpoint}
      onDelete={handleDelete}
      multiSelectionKeyCode={['Control', 'Meta']}
      selectionKeyCode="Shift"
      defaultViewport={board.wireframeViewport}
      fitView={compact || !board.wireframeViewport}
      fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
      minZoom={0.1}
      maxZoom={2}
      onMoveEnd={(_, viewport) => {
        if (!following) update({ ...board, wireframeViewport: viewport }, false)
      }}
      connectionRadius={30}
      snapToGrid
      snapGrid={[8, 8]}
    >
      <StableCanvasViewport following={!!following} />
      <Background color="var(--canvas-dot, #d7d2dd)" gap={24} size={1} />
      <LiveCursors
        peers={peers}
        nodes={cursorNodes}
        profile={profile}
        selectedIds={selection}
      />
      <Controls showInteractive={false} />
      <MiniMap
        style={{ width: 160, height: 104 }}
        pannable
        zoomable
        nodeColor={getNodeColor}
        maskColor="var(--minimap-mask, rgba(246,245,249,.65))"
      />
    </ReactFlow>
  )
}
import { StableCanvasViewport } from '@/shared/ui/index.tsx'
