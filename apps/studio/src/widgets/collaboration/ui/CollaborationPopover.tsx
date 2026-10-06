import { Spinner } from '@/shared/ui/index.tsx'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import { AccountActions } from '@/features/accountActions/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { AccountConnection } from '@/widgets/collaboration/ui/AccountConnection.tsx'
import { Check, Link, X } from 'lucide-react'
import { useCollaborationPopoverHandlers } from '../model/useCollaborationPopoverHandlers.tsx'
import { TeamActivityList } from './TeamActivityList.tsx'

import { CollaboratorList } from './CollaboratorList.tsx'
import { ProfileForm } from './ProfileForm.tsx'

import type { CollaborationPopoverProps } from '../types/collaborationPopoverProps.ts'
export function CollaborationPopover(props: CollaborationPopoverProps) {
  const { t } = useTranslation()

  const {
    panel,
    setPanel,
    opener,
    setBusy,
    setError,
    onProfile,
    profile,
    busy,
    workspaceId,
    setInvite,
    setCopied,
    invite,
    copied,
    activity,
    error,
  } = props

  const { handleCloseCollaborationPanelClick, createInvite, copyInvite } =
    useCollaborationPopoverHandlers({
      setPanel,
      opener,
      setBusy,
      workspaceId,
      setInvite,
      setCopied,
      setError,
      invite,
    })
  return (
    <section
      className="collaboration-popover"
      role="dialog"
      aria-label={
        panel === 'profile'
          ? t('Your profile')
          : panel === 'people'
            ? t('People and invites')
            : t('Team activity')
      }
    >
      <div className="collaboration-popover-heading">
        <strong>
          {panel === 'profile'
            ? t('Make yourself at home.')
            : panel === 'people'
              ? t('Better together.')
              : t('While we work.')}
        </strong>
        <button
          className="icon-button"
          aria-label={t('Close collaboration panel')}
          onClick={handleCloseCollaborationPanelClick}
        >
          <X size={17} />
        </button>
      </div>
      {panel === 'profile' ? (
        <>
          <ProfileForm
            {...props}

            profile={profile}
          />
          <AccountConnection onProfile={onProfile} />
          <AccountActions beforeLeave={props.beforeLeave} />
        </>
      ) : panel === 'people' ? (
        <>
          <CollaboratorList
            {...props}

            profile={profile}
          />
          <button
            className="button primary"
            disabled={busy || isDemoMode()}
            onClick={createInvite}
          >
            {busy ? <Spinner /> : <Link size={14} />}
            {t('Create invite link')}
          </button>
          {invite && (
            <label className="invite-output">
              {t('Single-use link · expires in 24 hours')}
              <input
                aria-label={t('Invite link')}
                readOnly
                value={invite}
                onFocus={(event) => event.target.select()}
              />
              <button className="button" onClick={copyInvite}>
                {copied ? <Check size={14} /> : <Link size={14} />}
                {copied ? t('Copied') : t('Copy link')}
              </button>
            </label>
          )}
          <p className="collaboration-hint">
            {t(
              isDemoMode()
                ? 'This is a local demo. Sign in outside the demo to connect an account or invite real teammates.'
                : 'Invitees can edit this workspace and invite others. Share the address of the hosted studio when joining from another device.',
            )}
          </p>
        </>
      ) : (
        <TeamActivityList activity={activity} t={t} />
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
