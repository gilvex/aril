export type AccountConnectionState = {
  account: { google: { email: string } | null } | undefined
  error: string
}
