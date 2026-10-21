import type { AccountInvitation } from '@aril/domain/invitations'
export type InvitationCardProps = {
  item: AccountInvitation
  busy: boolean
  onDecision: (id: string, decision: 'accept' | 'decline') => Promise<void>
}
