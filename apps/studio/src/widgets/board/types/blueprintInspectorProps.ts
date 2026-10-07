import type { Idea } from '@pomegranate/domain/workspace'
import { type Node } from '@xyflow/react'

export type BlueprintInspectorProps = {
  focusNode: (id: string) => void
  fitBoard: () => void
  addNode: (kind: Idea['data']['kind']) => void
  selectedNodes: import('@pomegranate/domain/workspace').Idea[]
  node: import('@pomegranate/domain/workspace').Idea | undefined
  edge:
    | {
        id: string
        source: string
        target: string
        type: 'smoothstep'
        label?: string | undefined
      }
    | undefined
  setInspectorOpen: (
    value:
      | import('../types').CanvasBoardState['inspectorPreference']
      | ((
          current: import('../types').CanvasBoardState['inspectorPreference'],
        ) => import('../types').CanvasBoardState['inspectorPreference']),
  ) => void
  inspectorToggle: import('react').RefObject<HTMLButtonElement | null>
  checkpoint: () => void
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: import('@pomegranate/domain/workspace').Board
  selectedIds: Set<string>
  onDelete: ({
    nodes,
    edges,
  }: {
    nodes: Node[]
    edges: { id: string }[]
  }) => void
  editField: import('react').RefObject<HTMLInputElement | null>
  updateNode: (data: Partial<Idea['data']>) => void
  openRequirement: (id: string) => void
  requirements: {
    id: string
    title: string
    description: string
    category: 'Deployment' | 'Access' | 'Operations' | 'Experience'
    priority: 'Must have' | 'Should have' | 'Later'
    status: 'Captured' | 'Designing' | 'Ready'
    acceptance: string
  }[]
  setSelected: (id: string | null) => void
  removeNode: () => void
  setSelectedEdge: (
    value:
      | import('../types').CanvasBoardState['selectedEdge']
      | ((
          current: import('../types').CanvasBoardState['selectedEdge'],
        ) => import('../types').CanvasBoardState['selectedEdge']),
  ) => void
}
