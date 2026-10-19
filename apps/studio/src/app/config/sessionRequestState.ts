import type { Profile } from '@aril/domain/collaboration'

export const sessionRequestState: {
  value:
    | Promise<{
        profile: Profile
        token?: string
        accountLinked?: boolean
        inviteRequired?: boolean
      }>
    | undefined
} = { value: undefined }
