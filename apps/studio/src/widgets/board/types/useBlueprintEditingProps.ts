export type UseBlueprintEditingProps = {
  setSelected: (id: string | null) => void
  setSelectedEdge: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']),
  ) => void
  setInspectorOpen: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference']),
  ) => void
  setTouchSelection: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['touchSelection']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['touchSelection'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['touchSelection']),
  ) => void
  setTool: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['tool']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['tool'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['tool']),
  ) => void
  setPalette: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['palette']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['palette'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['palette']),
  ) => void
  setInsertPoint: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint']),
  ) => void
  editField: import('react').RefObject<HTMLInputElement | null>
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: {
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
  selected: string | null
}
