export type WireframeDimensionInputHandlersProps = {
  dimension: 'width' | 'height'
  editNode: (
    changes: Partial<import('@aril/domain/wireframe').WireNode>,
  ) => void
}
