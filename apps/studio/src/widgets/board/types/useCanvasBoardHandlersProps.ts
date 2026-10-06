export type CanvasBoardHandlersProps = {
  following: import('@pomegranate/domain/collaboration').Presence | null
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
      camera?: import('@pomegranate/domain/collaboration').CameraPresence | null
      cursor?: { x: number; y: number } | null
      selected?: string[]
      selectedEdges?: string[]
      dragging?: import('@pomegranate/domain/collaboration').DragPosition[]
    },
    force?: boolean,
  ) => void
}
