export type WireframeDimensionInputProps = {
  dimension: 'width' | 'height'
  t: import('i18next').TFunction<'translation', undefined>
  node: import('@pomegranate/domain/wireframe').WireNode
  editNode: (
    changes: Partial<import('@pomegranate/domain/wireframe').WireNode>,
  ) => void
}
