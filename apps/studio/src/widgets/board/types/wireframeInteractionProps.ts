export type WireframeInteractionProps = {
  trigger: string
  setTrigger: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['trigger']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['trigger'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['trigger']),
  ) => void
  targetId: string
  setTargetId: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['targetId']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['targetId'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['targetId']),
  ) => void
  graph: import('@aril/domain/wireframe').Wireframe
  node: import('@aril/domain/wireframe').WireNode
  connect: (source: string, target: string, label?: string) => void
  setEdgeId: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']),
  ) => void
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
}
