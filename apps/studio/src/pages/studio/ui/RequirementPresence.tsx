import type { Profile, RequirementPresence } from '@pomegranate/domain/collaboration'
import { Avatar } from './CollaborationBar'

export const requirementFieldLabels = {
  title: 'title', description: 'description', acceptance: 'acceptance criteria',
  priority: 'priority', status: 'status', category: 'area',
}
export type RequirementViewer = { profile: Profile; requirement: RequirementPresence }

export function RequirementPeople({ people, currentUserId }: { people: RequirementViewer[]; currentUserId: string }) {
  if (!people.length) return null
  return (
    <span className="requirement-people" aria-label="Requirement collaborators">
      {people.map(({ profile, requirement }) => {
        const action = requirement.field
          ? `${requirement.typing ? 'Typing in' : 'Editing'} ${requirementFieldLabels[requirement.field]}`
          : 'Viewing'
        return (
          <span className="requirement-person" key={profile.id} style={{ borderColor: profile.color }}>
            <Avatar profile={profile} />
            <span><strong>{profile.name}{profile.id === currentUserId ? ' (you)' : ''}</strong><small>{action}</small></span>
          </span>
        )
      })}
    </span>
  )
}
