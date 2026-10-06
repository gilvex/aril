import type { SelectionBadgesProps } from '../types/selectionBadgesProps.ts'
import { Avatar } from '../../../entities/collaboration/index.ts'

export function SelectionBadges({
  profiles,
  currentUserId,
}: SelectionBadgesProps) {
  const people = [
    ...new Map(profiles.map((profile) => [profile.id, profile])).values(),
  ]
  return (
    <div
      className="selection-badges"
      aria-label={`Selected by ${people.map((person) => person.name).join(', ')}`}
    >
      {people.map((person) => (
        <span
          className="selection-person"
          key={person.id}
          style={{ borderColor: person.color }}
        >
          <Avatar profile={person} />
          <span>
            {person.name}
            {person.id === currentUserId ? ' (you)' : ''}
          </span>
        </span>
      ))}
    </div>
  )
}
