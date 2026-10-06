import type { AvatarProps } from '@/entities/collaboration/types/avatarProps.ts'

export function Avatar({ profile }: AvatarProps) {
  return (
    <span className="person-avatar" style={{ background: profile.color }}>
      {profile.avatar ? (
        <img src={profile.avatar} alt="" />
      ) : (
        profile.name.trim().slice(0, 2).toUpperCase()
      )}
    </span>
  )
}
