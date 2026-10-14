export type WireframeDimensionsProps = {
  t: import('i18next').TFunction<'translation', undefined>
  node: import('@aril/domain/wireframe').WireNode
  editNode: (
    changes: Partial<import('@aril/domain/wireframe').WireNode>,
  ) => void
}
