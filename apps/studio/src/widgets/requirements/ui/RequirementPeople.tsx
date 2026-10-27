import { Text } from '@/shared/ui/Text.tsx'
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
    <Text
      as="span"
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
          <Text
            as="span"
            className="requirement-person"
            key={profile.id}
            style={{ borderColor: profile.color }}
          >
            <Avatar profile={profile} />
            <Text as="span">
              <Text as="strong">
                {profile.name}
                {profile.id === currentUserId ? t(' (you)') : ''}
              </Text>
              <Text as="small">{action}</Text>
            </Text>
          </Text>
        )
      })}
    </Text>
  )
}
