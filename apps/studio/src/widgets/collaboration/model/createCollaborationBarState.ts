import type { Profile } from '@pomegranate/domain/collaboration'
export function createCollaborationBarState(profile: Profile) {
  const name: string = profile.name
  const avatar: string = profile.avatar
  const busy: boolean = false
  const error: string = ''
  const invite: string = ''
  const copied: boolean = false
  return { name, avatar, busy, error, invite, copied }
}
