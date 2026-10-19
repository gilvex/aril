export type GuestLink = {
  role: 'member' | 'viewer'
  id: string
  name: string
  expiresAt: number
  revoked: boolean
  guests: number
}
