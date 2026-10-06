import { Avatar } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectionBadgesProps } from '@/widgets/board/types/selectionBadgesProps.ts'

export function SelectionBadges({
  profiles,
  currentUserId,
}: SelectionBadgesProps) {
  const { t } = useTranslation()

  const people = [
    ...new Map(profiles.map((profile) => [profile.id, profile])).values(),
  ]
  return (
    <div
      className="selection-badges"
      aria-label={t('Selected by {{value}}', {
        value: people.map((person) => person.name).join(', '),
      })}
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
            {person.id === currentUserId ? t(' (you)') : ''}
          </span>
        </span>
      ))}
    </div>
  )
}
