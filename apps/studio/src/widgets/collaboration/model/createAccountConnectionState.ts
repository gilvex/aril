export function createAccountConnectionState() {
  const account: { google: { email: string } | null } | undefined = undefined
  const error: string = ''
  return { account, error }
}
