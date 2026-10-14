export type WireframeMultiSelectionHandlersProps = {
  save: (
    next: import('@aril/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  graph: import('@aril/domain/wireframe').Wireframe
  selection: Set<string>
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
}
