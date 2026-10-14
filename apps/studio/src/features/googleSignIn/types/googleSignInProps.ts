import type { Profile } from '@aril/domain/collaboration'
export type GoogleSignInProps = {
  link?: boolean
  onSuccess: (profile: Profile) => void
}
