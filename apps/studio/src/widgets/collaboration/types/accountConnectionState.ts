export type AccountConnectionState = {
  account:
    | { guestExpiresAt?: number | null; google: { email: string } | null }
    | undefined
  error: string
}
