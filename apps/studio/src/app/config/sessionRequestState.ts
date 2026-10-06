import type { Profile } from '@pomegranate/domain/collaboration'

export const sessionRequestState: {
  value:
    | Promise<{
        profile: Profile
        token?: string
        googleLinked?: boolean
        inviteRequired?: boolean
      }>
    | undefined
} = { value: undefined }
