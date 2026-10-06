import { requirementFieldLabels } from '../config/requirementFieldLabels.ts'
import type { RequirementPeopleProps } from '../types/requirementPeopleProps.ts'
import { Avatar } from '../../../entities/collaboration/index.ts'
export function RequirementPeople({
  people,
  currentUserId,
}: RequirementPeopleProps) {
  if (!people.length) return null
  return (
    <span className="requirement-people" aria-label="Requirement collaborators">
      {people.map(({ profile, requirement }) => {
        const action = requirement.field
          ? `${requirement.typing ? 'Typing in' : 'Editing'} ${requirementFieldLabels[requirement.field]}`
          : 'Viewing'
        return (
          <span
            className="requirement-person"
            key={profile.id}
            style={{ borderColor: profile.color }}
          >
            <Avatar profile={profile} />
            <span>
              <strong>
                {profile.name}
                {profile.id === currentUserId ? ' (you)' : ''}
              </strong>
              <small>{action}</small>
            </span>
          </span>
        )
      })}
    </span>
  )
}
