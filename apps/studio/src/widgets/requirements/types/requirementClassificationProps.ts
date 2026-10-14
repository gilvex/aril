import type { Requirement } from '@aril/domain/workspace'

export type RequirementClassificationProps = {
  fieldProps: (
    name: import('@aril/domain/collaboration').RequirementField,
  ) => {
    onFocus: () => void
    onBlur: () => void
    onInput: () => void
    style: { outline: string; outlineOffset: number } | undefined
  }
  current: {
    id: string
    title: string
    description: string
    category: 'Deployment' | 'Access' | 'Operations' | 'Experience'
    priority: 'Must have' | 'Should have' | 'Later'
    status: 'Captured' | 'Designing' | 'Ready'
    acceptance: string
  }
  update: (patch: Partial<Requirement>) => void
  fieldHint: (
    name: import('@aril/domain/collaboration').RequirementField,
  ) => import('react').JSX.Element | null
}
