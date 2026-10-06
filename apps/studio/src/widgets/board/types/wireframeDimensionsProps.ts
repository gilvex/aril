export type WireframeDimensionsProps = {
  t: import('i18next').TFunction<'translation', undefined>
  node: import('@pomegranate/domain/wireframe').WireNode
  editNode: (
    changes: Partial<import('@pomegranate/domain/wireframe').WireNode>,
  ) => void
}
