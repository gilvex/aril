export type WireframeDimensionInputHandlersProps = {
  dimension: 'width' | 'height'
  editNode: (
    changes: Partial<import('@pomegranate/domain/wireframe').WireNode>,
  ) => void
}
