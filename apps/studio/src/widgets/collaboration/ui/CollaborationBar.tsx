import { Avatar } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { CollaborationBarProps as Props } from '@/widgets/collaboration/types/collaborationBarProps.ts'
import { Users } from 'lucide-react'
import { useCollaborationController } from '../model/useCollaborationController.ts'
import { CollaborationPopover } from './CollaborationPopover.tsx'
export function CollaborationBar({
  beforeLeave,
  panel,
  setPanel,
  workspaceId,
  followId,
  onFollow,
  profile,
  peers,
  activity,
  connected,
  onProfile,
}: Props) {
  const { t } = useTranslation()

  const {
    root,
    people,
    open,
    opener,
    setBusy,
    setError,
    name,
    setAvatar,
    avatar,
    setName,
    busy,
    setInvite,
    setCopied,
    invite,
    copied,
    error,
  } = useCollaborationController({ profile, peers, panel, setPanel })
  return (
    <div className="collaboration-bar" ref={root}>
      <span
        className={`connection-dot ${connected ? 'online' : ''}`}
        title={
          connected
            ? t('Live collaboration connected')
            : t('Reconnecting to collaborators')
        }
        aria-label={
          connected
            ? t('Live collaboration connected')
            : t('Reconnecting to collaborators')
        }
      />
      <button
        className="people-button"
        aria-label={t('{{count}} people in studio', { count: people.length })}
        onClick={() => open('people')}
      >
        <Users size={16} />
        <span>{people.length}</span>
      </button>
      <button
        className="profile-button"
        aria-label={t('Edit profile for {{name}}', { name: profile.name })}
        onClick={() => open('profile')}
      >
        <Avatar profile={profile} />
        <span>{profile.name}</span>
      </button>
      {panel && (
        <CollaborationPopover
          beforeLeave={beforeLeave}
          panel={panel}
          setPanel={setPanel}
          opener={opener}
          setBusy={setBusy}
          setError={setError}
          onProfile={onProfile}
          profile={profile}
          name={name}
          setAvatar={setAvatar}
          avatar={avatar}
          setName={setName}
          busy={busy}
          peers={peers}
          connected={connected}
          followId={followId}
          onFollow={onFollow}
          workspaceId={workspaceId}
          setInvite={setInvite}
          setCopied={setCopied}
          invite={invite}
          copied={copied}
          activity={activity}
          error={error}
        />
      )}
    </div>
  )
}
