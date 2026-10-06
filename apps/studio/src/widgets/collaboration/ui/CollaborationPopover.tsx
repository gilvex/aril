import { PeopleInvites } from './PeopleInvites.tsx'
import { AccountActions } from '@/features/accountActions/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { AccountConnection } from '@/widgets/collaboration/ui/AccountConnection.tsx'
import { X } from 'lucide-react'
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
    workspaceId,
    setInvite,
    setCopied,
    invite,
    activity,
    error,
  } = props

  const { handleCloseCollaborationPanelClick } =
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
          <PeopleInvites {...props} />
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
