export type BoardPickerItemHandlersProps = {
  onBoard: (id: string) => void
  item: {
    id: string
    name: string
    description: string
    nodes: {
      id: string
      type: 'idea'
      position: { x: number; y: number }
      data: {
        title: string
        description: string
        kind: 'layer' | 'service' | 'database' | 'instance' | 'person' | 'note'
        status: 'Exploring' | 'Decided' | 'Question'
        notes: string
        requirements: string[]
      }
    }[]
    edges: {
      id: string
      source: string
      target: string
      type: 'smoothstep'
      label?: string | undefined
    }[]
    wireframe?:
      | {
          nodes: {
            id: string
            type: 'wireframe'
            position: { x: number; y: number }
            width: number
            height: number
            data: {
              kind:
                | 'screen'
                | 'text'
                | 'button'
                | 'input'
                | 'card'
                | 'image'
                | 'navigation'
              title: string
              content: string
              tone: 'plain' | 'soft' | 'accent'
            }
            parentId?: string | undefined
          }[]
          edges: {
            id: string
            source: string
            target: string
            label: string
            type: 'smoothstep'
          }[]
        }
      | undefined
    wireframeViewport?: { x: number; y: number; zoom: number } | undefined
    viewport?: { x: number; y: number; zoom: number } | undefined
  }
  setOpen: (
    value:
      | import('../types/canvasNavigationState.ts').CanvasNavigationState['open']
      | ((
          current: import('../types/canvasNavigationState.ts').CanvasNavigationState['open'],
        ) => import('../types/canvasNavigationState.ts').CanvasNavigationState['open']),
  ) => void
  present: Pick<
    import('@pomegranate/domain/collaboration').Presence,
    'profile' | 'view' | 'boardId'
  >[]
}
