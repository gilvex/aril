export type LinkedRequirementHandlersProps = {
  updateNode: (
    data: Partial<import('@aril/domain/workspace').Idea['data']>,
  ) => void
  node: {
    id: string
    type: 'idea'
    position: { x: number; y: number }
    data: import('@aril/domain/workspace').Idea['data']
  }
  id: string
}
