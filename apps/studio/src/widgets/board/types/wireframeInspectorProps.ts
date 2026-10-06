import type { CanvasInsertPoint } from '@/widgets/board/types/canvasInsertPoint.ts'
import {
  type Wireframe,
  type WireKind,
  type WireNode,
} from '@pomegranate/domain/wireframe'

export type WireframeInspectorProps = {
  preview: boolean
  selected: import('@pomegranate/domain/wireframe').WireNode[]
  node: import('@pomegranate/domain/wireframe').WireNode | undefined
  edge:
    | {
        id: string
        source: string
        target: string
        label: string
        type: 'smoothstep'
      }
    | undefined
  setInspectorOpen: (
    value:
      | import('../types').WireframeBoardState['inspectorPreference']
      | ((
          current: import('../types').WireframeBoardState['inspectorPreference'],
        ) => import('../types').WireframeBoardState['inspectorPreference']),
  ) => void
  inspectorToggle: import('react').RefObject<HTMLButtonElement | null>
  previewMessage: string
  graph: import('@pomegranate/domain/wireframe').Wireframe
  focus: (id: string) => void
  setPreviewMessage: (
    value:
      | import('../types').WireframeBoardState['previewMessage']
      | ((
          current: import('../types').WireframeBoardState['previewMessage'],
        ) => import('../types').WireframeBoardState['previewMessage']),
  ) => void
  setPreview: (
    value:
      | import('../types').WireframeBoardState['preview']
      | ((
          current: import('../types').WireframeBoardState['preview'],
        ) => import('../types').WireframeBoardState['preview']),
  ) => void
  save: (next: Wireframe, record?: boolean) => void
  selection: Set<string>
  duplicate: () => void
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
  editField: import('react').RefObject<HTMLInputElement | null>
  editData: (changes: Partial<WireNode['data']>) => void
  editNode: (changes: Partial<WireNode>) => void
  screens: import('@pomegranate/domain/wireframe').WireNode[]
  trigger: string
  setTrigger: (
    value:
      | import('../types').WireframeBoardState['trigger']
      | ((
          current: import('../types').WireframeBoardState['trigger'],
        ) => import('../types').WireframeBoardState['trigger']),
  ) => void
  targetId: string
  setTargetId: (
    value:
      | import('../types').WireframeBoardState['targetId']
      | ((
          current: import('../types').WireframeBoardState['targetId'],
        ) => import('../types').WireframeBoardState['targetId']),
  ) => void
  connect: (source: string, target: string, label?: string) => void
  setEdgeId: (
    value:
      | import('../types').WireframeBoardState['edgeId']
      | ((
          current: import('../types').WireframeBoardState['edgeId'],
        ) => import('../types').WireframeBoardState['edgeId']),
  ) => void
  add: (kind: WireKind, at?: CanvasInsertPoint) => void
}
