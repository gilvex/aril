import type { Requirement } from '@pomegranate/domain/workspace'
export type RequirementDetailsHandlersProps = {
  update: (patch: Partial<Requirement>) => void
  change: (
    fn: (
      w: import('@pomegranate/domain/workspace').Workspace,
    ) => import('@pomegranate/domain/workspace').Workspace,
  ) => void
  current: {
    id: string
    title: string
    description: string
    category: 'Deployment' | 'Access' | 'Operations' | 'Experience'
    priority: 'Must have' | 'Should have' | 'Later'
    status: 'Captured' | 'Designing' | 'Ready'
    acceptance: string
  }
  selectRequirement: (id: string | null) => void
}
