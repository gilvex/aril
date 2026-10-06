import type { PresenceAvatarsProps } from '../types/presenceAvatarsProps.ts'
import { Avatar } from './Avatar.tsx'
export function PresenceAvatars({ profiles, limit = 3 }: PresenceAvatarsProps) {
  const people = [
    ...new Map(profiles.map((profile) => [profile.id, profile])).values(),
  ]
  if (!people.length) return null
  const names = people.map((profile) => profile.name).join(', ')
  return (
    <span
      className="tab-presence"
      role="img"
      aria-label={`${names} viewing here`}
      title={`${names} viewing here`}
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
