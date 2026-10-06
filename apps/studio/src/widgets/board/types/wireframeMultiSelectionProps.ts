export type WireframeMultiSelectionProps = {
  save: (
    next: import('@pomegranate/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  graph: import('@pomegranate/domain/wireframe').Wireframe
  selection: Set<string>
  duplicate: () => void
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
}
