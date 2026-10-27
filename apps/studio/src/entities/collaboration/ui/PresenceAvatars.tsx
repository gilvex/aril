import type { PresenceAvatarsProps } from '@/entities/collaboration/types/presenceAvatarsProps.ts'
import { Avatar } from '@/entities/collaboration/ui/Avatar.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
export function PresenceAvatars({ profiles, limit = 3 }: PresenceAvatarsProps) {
  const { t } = useTranslation()

  const people = [
    ...new Map(profiles.map((profile) => [profile.id, profile])).values(),
  ]
  if (!people.length) return null
  const names = people.map((profile) => profile.name).join(', ')
  return (
    <span
      className="tab-presence"
      role="img"
      aria-label={t('{{value}} viewing here', { value: names })}
      title={t('{{value}} viewing here', { value: names })}
    >
      {people.slice(0, limit).map((profile) => (
        <Avatar key={profile.id} profile={profile} />
      ))}
      {people.length > limit && (
        <span className="tab-presence-more">+{people.length - limit}</span>
      )}
    </span>
  )
}
