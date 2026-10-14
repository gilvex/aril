export type WireframeBoardHandlersProps = {
  following: import('@aril/domain/collaboration').Presence | null
  flow:
    | import('@xyflow/react').ReactFlowInstance<
        import('../types/wireFlowNode.ts').WireFlowNode
      >
    | null
  sendPresence: (
    changes: {
      camera?: import('@aril/domain/collaboration').CameraPresence | null
      cursor?: { x: number; y: number } | null
      selected?: string[]
      selectedEdges?: string[]
      dragging?: import('@aril/domain/collaboration').DragPosition[]
    },
    force?: boolean,
  ) => void
}
