import { type Wireframe } from '@pomegranate/domain/wireframe'
export type UseWireframeConnectionsProps = {
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
  save: (next: Wireframe, record?: boolean) => void
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
  setEdgeId: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']),
  ) => void
  setTargetId: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['targetId']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['targetId'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['targetId']),
  ) => void
  selection: Set<string>
}
