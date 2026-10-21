import type { AccountInvitation } from '@aril/domain/invitations'
export type InvitationInboxContentProps = { invitations: AccountInvitation[]; busy: boolean; error: string; message: string; loaded: boolean; decide: (id: string, decision: 'accept' | 'decline') => Promise<void> }
