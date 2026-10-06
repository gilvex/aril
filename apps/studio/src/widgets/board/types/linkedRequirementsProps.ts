export type LinkedRequirementsProps = {
  node: import('@pomegranate/domain/workspace').Idea
  openRequirement: (id: string) => void
  requirements: {
    id: string
    title: string
    description: string
    category: 'Deployment' | 'Access' | 'Operations' | 'Experience'
    priority: 'Must have' | 'Should have' | 'Later'
    status: 'Captured' | 'Designing' | 'Ready'
    acceptance: string
  }[]
  updateNode: (
    data: Partial<import('@pomegranate/domain/workspace').Idea['data']>,
  ) => void
}
