import { Text } from '@/shared/ui/Text.tsx'
import { InviteUserForm } from '@/features/invitations/index.ts'
import { guestLinkNoExpiry } from '@aril/domain/collaboration'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { Check, Link } from 'lucide-react'
import { Spinner } from '@/shared/ui/index.tsx'
import { GuestLinks } from '@/features/guestLinks/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import { useCollaborationPopoverHandlers } from '../model/useCollaborationPopoverHandlers.tsx'
import type { CollaborationPopoverProps } from '../types/collaborationPopoverProps.ts'

export function PeopleInvites(props: CollaborationPopoverProps) {
  const { t, i18n } = useTranslation()
  const role = useWorkspaceRole()
  const { createInvite, copyInvite } = useCollaborationPopoverHandlers(props)
  if (props.profile.guestExpiresAt)
    return (
      <Text as="p" className="collaboration-hint">
        {props.profile.guestExpiresAt === guestLinkNoExpiry
          ? t('Guest access lasts until the link is revoked.')
          : t('Guest access expires {{time}}', {
              time: new Date(props.profile.guestExpiresAt).toLocaleString(
                i18n.language,
              ),
            })}
      </Text>
    )
  if (role !== 'owner')
    return (
      <Text as="p" className="collaboration-hint">
        {t('Only the workspace owner can manage access.')}
      </Text>
    )
  return (
    <>
      {!isDemoMode() && <InviteUserForm workspaceId={props.workspaceId} />}
      <button
        className="button primary"
        disabled={props.busy || isDemoMode()}
        onClick={createInvite}
      >
        {props.busy ? <Spinner /> : <Link size={14} />}
        <Text>{t('Create invite link')}</Text>
      </button>
      {props.invite && (
        <Text as="label" className="invite-output">
          {t('Single-use link · expires in 24 hours')}
          <input
            aria-label={t('Invite link')}
            readOnly
            value={props.invite}
            onFocus={(event) => event.target.select()}
          />
          <button className="button" onClick={copyInvite}>
            {props.copied ? <Check size={14} /> : <Link size={14} />}
            <Text>{props.copied ? t('Copied') : t('Copy link')}</Text>
          </button>
        </Text>
      )}
      <Text as="p" className="collaboration-hint">
        {t(
          isDemoMode()
            ? 'This is a local demo. Sign in outside the demo to connect an account or invite real teammates.'
            : 'Permanent invitations require a connected sign-in account. For access without sign-in, create a guest link below.',
        )}
      </Text>
      {!isDemoMode() && (
        <GuestLinks key={props.workspaceId} workspaceId={props.workspaceId} />
      )}
    </>
  )
}
