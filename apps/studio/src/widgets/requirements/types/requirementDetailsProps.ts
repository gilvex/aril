import type { RequirementViewer } from '@/widgets/requirements/types/requirementViewer.ts'
import type { RequirementField } from '@aril/domain/collaboration'
import type { Requirement } from '@aril/domain/workspace'

export type RequirementDetailsProps = {
  propertiesOpen: boolean
  toggleProperties: () => void
  current: Requirement
  openWork: (
    link: import('@aril/domain/workspace').RequirementLink,
  ) => void
  selectRequirement: (id: string | null) => void
  peopleFor: (id: string) => RequirementViewer[]
  profile: import('@aril/domain/collaboration').Profile
  fieldProps: (name: RequirementField) => {
    onFocus: () => void
    onBlur: () => void
    onInput: () => void
    style: { outline: string; outlineOffset: number } | undefined
  }
  update: (patch: Partial<Requirement>) => void
  fieldHint: (name: RequirementField) => import('react').JSX.Element | null
  workspace: import('@aril/domain/workspace').Workspace
  openBoard: (id: string) => void
  change: (
    fn: (
      w: import('@aril/domain/workspace').Workspace,
    ) => import('@aril/domain/workspace').Workspace,
  ) => void
}
