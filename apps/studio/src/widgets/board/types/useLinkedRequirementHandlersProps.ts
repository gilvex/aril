export type LinkedRequirementHandlersProps = {
  updateNode: (
    data: Partial<import('@pomegranate/domain/workspace').Idea['data']>,
  ) => void
  node: {
    id: string
    type: 'idea'
    position: { x: number; y: number }
    data: {
      title: string
      description: string
      kind: 'layer' | 'service' | 'database' | 'instance' | 'person' | 'note'
      status: 'Exploring' | 'Decided' | 'Question'
      notes: string
      requirements: string[]
    }
  }
  id: string
}
