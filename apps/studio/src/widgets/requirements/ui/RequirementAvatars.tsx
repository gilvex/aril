import { Avatar } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementPeopleProps } from '../types/requirementPeopleProps.ts'
export function RequirementAvatars({
  people,
  currentUserId,
}: RequirementPeopleProps) {
  const { t } = useTranslation()
  if (!people.length) return null
  return (
    <span className="req-avatars" aria-label={t('Requirement collaborators')}>
      {people.slice(0, 3).map(({ profile, requirement }) => (
        <span
          key={profile.id}
          style={{ borderColor: profile.color }}
          title={`${profile.name}${profile.id === currentUserId ? t(' (you)') : ''} — ${t(requirement.typing ? 'typing in' : requirement.field ? 'editing' : 'Viewing')}${requirement.field ? ` ${t(requirement.field)}` : ''}`}
        >
          <Avatar profile={profile} />
        </span>
      ))}
      {people.length > 3 && (
        <span
          title={people
            .slice(3)
            .map((person) => person.profile.name)
            .join(', ')}
        >
          +{people.length - 3}
        </span>
      )}
    </span>
  )
}
