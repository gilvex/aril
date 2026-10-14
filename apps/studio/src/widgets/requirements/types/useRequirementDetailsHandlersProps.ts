import type { Requirement } from '@aril/domain/workspace'
export type RequirementDetailsHandlersProps = {
  update: (patch: Partial<Requirement>) => void
  change: (
    fn: (
      w: import('@aril/domain/workspace').Workspace,
    ) => import('@aril/domain/workspace').Workspace,
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
