export type WireframeBoardHandlersProps = {
  following: import('@pomegranate/domain/collaboration').Presence | null
  flow:
    | import('@xyflow/react').ReactFlowInstance<
        import('../types/wireFlowNode.ts').WireFlowNode
      >
    | null
  sendPresence: (
    changes: {
      camera?: import('@pomegranate/domain/collaboration').CameraPresence | null
      cursor?: { x: number; y: number } | null
      selected?: string[]
      selectedEdges?: string[]
      dragging?: import('@pomegranate/domain/collaboration').DragPosition[]
    },
    force?: boolean,
  ) => void
}
