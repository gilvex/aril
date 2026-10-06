import type { RequirementViewer } from '@/widgets/requirements/types/requirementViewer.ts'

export type RequirementListProps = {
  results: {
    id: string
    title: string
    description: string
    category: 'Deployment' | 'Access' | 'Operations' | 'Experience'
    priority: 'Must have' | 'Should have' | 'Later'
    status: 'Captured' | 'Designing' | 'Ready'
    acceptance: string
  }[]
  selected: string | null
  selectRequirement: (id: string | null) => void
  peopleFor: (id: string) => RequirementViewer[]
  profile: import('@pomegranate/domain/collaboration').Profile
}
