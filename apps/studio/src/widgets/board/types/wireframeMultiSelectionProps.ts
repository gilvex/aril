export type WireframeMultiSelectionProps = {
  save: (
    next: import('@aril/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  graph: import('@aril/domain/wireframe').Wireframe
  selection: Set<string>
  duplicate: () => void
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
}
