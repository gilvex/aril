import type { Profile } from '@pomegranate/domain/collaboration'
export type GoogleSignInProps = {
  link?: boolean
  onSuccess: (profile: Profile) => void
}
