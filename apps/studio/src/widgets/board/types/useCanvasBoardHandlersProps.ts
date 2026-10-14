export type CanvasBoardHandlersProps = {
  following: import('@aril/domain/collaboration').Presence | null
  flow:
    | import('@xyflow/react').ReactFlowInstance<
        import('@xyflow/react').Node<{
          title: string
          description: string
          kind:
            'layer' | 'service' | 'database' | 'instance' | 'person' | 'note'
          status: 'Exploring' | 'Decided' | 'Question'
          notes: string
          requirements: string[]
        }>
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
