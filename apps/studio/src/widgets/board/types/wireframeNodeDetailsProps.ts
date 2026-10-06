import { type WireNode } from '@pomegranate/domain/wireframe'

export type WireframeNodeDetailsProps = {
  node: import('@pomegranate/domain/wireframe').WireNode
  editField: import('react').RefObject<HTMLInputElement | null>
  editData: (changes: Partial<WireNode['data']>) => void
  editNode: (changes: Partial<WireNode>) => void
  screens: import('@pomegranate/domain/wireframe').WireNode[]
  graph: import('@pomegranate/domain/wireframe').Wireframe
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
  duplicate: () => void
  save: (
    next: import('@pomegranate/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  selection: Set<string>
}
