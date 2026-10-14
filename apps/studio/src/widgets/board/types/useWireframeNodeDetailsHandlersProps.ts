import { type WireNode } from '@aril/domain/wireframe'
export type WireframeNodeDetailsHandlersProps = {
  screens: import('@aril/domain/wireframe').WireNode[]
  node: import('@aril/domain/wireframe').WireNode
  graph: import('@aril/domain/wireframe').Wireframe
  editNode: (changes: Partial<WireNode>) => void
  editData: (changes: Partial<WireNode['data']>) => void
  save: (
    next: import('@aril/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  selection: Set<string>
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
}
