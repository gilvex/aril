export type WireframePreviewDestinationHandlersProps = {
  focus: (id: string) => void
  e: {
    id: string
    source: string
    target: string
    label: string
    type: 'smoothstep'
  }
  setPreviewMessage: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['previewMessage']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['previewMessage'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['previewMessage']),
  ) => void
  graph: {
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
}
