import type { Profile } from '@pomegranate/domain/collaboration'

export const sessionRequestState: {
  value: Promise<{ profile: Profile; token?: string }> | undefined
} = { value: undefined }
