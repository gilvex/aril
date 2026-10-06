export type WireframeMultiSelectionHandlersProps = {
  save: (
    next: import('@pomegranate/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  graph: import('@pomegranate/domain/wireframe').Wireframe
  selection: Set<string>
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
}
