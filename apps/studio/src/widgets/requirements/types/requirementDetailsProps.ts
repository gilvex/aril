import type { RequirementViewer } from '@/widgets/requirements/types/requirementViewer.ts'
import type { RequirementField } from '@pomegranate/domain/collaboration'
import type { Requirement } from '@pomegranate/domain/workspace'

export type RequirementDetailsProps = {
  current: Requirement
  openWork: (
    link: import('@pomegranate/domain/workspace').RequirementLink,
  ) => void
  selectRequirement: (id: string | null) => void
  peopleFor: (id: string) => RequirementViewer[]
  profile: import('@pomegranate/domain/collaboration').Profile
  fieldProps: (name: RequirementField) => {
    onFocus: () => void
    onBlur: () => void
    onInput: () => void
    style: { outline: string; outlineOffset: number } | undefined
  }
  update: (patch: Partial<Requirement>) => void
  fieldHint: (name: RequirementField) => import('react').JSX.Element | null
  workspace: import('@pomegranate/domain/workspace').Workspace
  openBoard: (id: string) => void
  change: (
    fn: (
      w: import('@pomegranate/domain/workspace').Workspace,
    ) => import('@pomegranate/domain/workspace').Workspace,
  ) => void
}
