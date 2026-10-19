import type { LinkedAccount } from '@aril/domain/accounts'
export type AccountConnectionState = {
  account:
    | {
        guestExpiresAt?: number | null
        google: { email: string } | null
        accounts?: LinkedAccount[]
      }
    | undefined
  error: string
}
