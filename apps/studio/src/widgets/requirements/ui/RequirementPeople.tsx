import { Avatar } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { requirementFieldLabels } from '@/widgets/requirements/config/requirementFieldLabels.ts'
import type { RequirementPeopleProps } from '@/widgets/requirements/types/requirementPeopleProps.ts'
export function RequirementPeople({
  people,
  currentUserId,
}: RequirementPeopleProps) {
  const { t } = useTranslation()

  if (!people.length) return null
  return (
    <span
      className="requirement-people"
      aria-label={t('Requirement collaborators')}
    >
      {people.map(({ profile, requirement }) => {
        const action = requirement.field
          ? t(
              requirement.typing ? 'Typing in {{field}}' : 'Editing {{field}}',
              { field: t(requirementFieldLabels[requirement.field]) },
            )
          : t('Viewing')
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
                {profile.id === currentUserId ? t(' (you)') : ''}
              </strong>
              <small>{action}</small>
            </span>
          </span>
        )
      })}
    </span>
  )
}
