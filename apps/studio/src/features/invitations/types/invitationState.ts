import type {
  AccountInvitation,
  InvitationUser,
} from '@aril/domain/invitations'
export type InvitationState = {
  open: boolean
  value: string
  role: 'member' | 'viewer'
  selected: InvitationUser | null
  users: InvitationUser[]
  invitations: AccountInvitation[]
  loaded: boolean
  busy: boolean
  error: string
  message: string
}
