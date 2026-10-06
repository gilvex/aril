import { type WireNode } from '@pomegranate/domain/wireframe'
export type WireframeNodeDetailsHandlersProps = {
  screens: import('@pomegranate/domain/wireframe').WireNode[]
  node: import('@pomegranate/domain/wireframe').WireNode
  graph: import('@pomegranate/domain/wireframe').Wireframe
  editNode: (changes: Partial<WireNode>) => void
  editData: (changes: Partial<WireNode['data']>) => void
  save: (
    next: import('@pomegranate/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  selection: Set<string>
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
}
