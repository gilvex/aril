import { Check, Link } from 'lucide-react'
import { Spinner } from '@/shared/ui/index.tsx'
import { GuestLinks } from '@/features/guestLinks/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import { useCollaborationPopoverHandlers } from '../model/useCollaborationPopoverHandlers.tsx'
import type { CollaborationPopoverProps } from '../types/collaborationPopoverProps.ts'

export function PeopleInvites(props: CollaborationPopoverProps) {
  const { t, i18n } = useTranslation()
  const { createInvite, copyInvite } = useCollaborationPopoverHandlers(props)
  if (props.profile.guestExpiresAt)
    return (
      <p className="collaboration-hint">
        {t('Guest access expires {{time}}', {
          time: new Date(props.profile.guestExpiresAt).toLocaleString(
            i18n.language,
          ),
        })}
      </p>
    )
  return (
    <>
      <button
        className="button primary"
        disabled={props.busy || isDemoMode()}
        onClick={createInvite}
      >
        {props.busy ? <Spinner /> : <Link size={14} />}
        {t('Create invite link')}
      </button>
      {props.invite && (
        <label className="invite-output">
          {t('Single-use link · expires in 24 hours')}
          <input
            aria-label={t('Invite link')}
            readOnly
            value={props.invite}
            onFocus={(event) => event.target.select()}
          />
          <button className="button" onClick={copyInvite}>
            {props.copied ? <Check size={14} /> : <Link size={14} />}
            {props.copied ? t('Copied') : t('Copy link')}
          </button>
        </label>
      )}
      <p className="collaboration-hint">
        {t(
          isDemoMode()
            ? 'This is a local demo. Sign in outside the demo to connect an account or invite real teammates.'
            : 'Permanent invitations require Google sign-in. For temporary access, create a guest link below.',
        )}
      </p>
      {!isDemoMode() && (
        <GuestLinks key={props.workspaceId} workspaceId={props.workspaceId} />
      )}
    </>
  )
}
