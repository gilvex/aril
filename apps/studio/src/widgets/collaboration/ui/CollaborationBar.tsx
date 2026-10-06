import type { Profile } from '@pomegranate/domain/collaboration'
import { Check, Link, Users, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Avatar } from '../../../entities/collaboration/index.ts'
import { request } from '../../../shared/api/request.ts'
import { workspaceHeaders } from '../../../shared/api/workspaceHeaders.ts'
import { createCollaborationBarState } from '../model/createCollaborationBarState.ts'
import { useCollaborationBarModel } from '../model/useCollaborationBarModel.ts'
import type { CollaborationBarProps as Props } from '../types/collaborationBarProps.ts'
import { avatarFrom } from '../utils/avatarFrom.ts'
import { AccountConnection } from './AccountConnection.tsx'
export function CollaborationBar({
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
  const {
    name,
    setName,
    avatar,
    setAvatar,
    busy,
    setBusy,
    error,
    setError,
    invite,
    setInvite,
    copied,
    setCopied,
  } = useCollaborationBarModel(() => createCollaborationBarState(profile))

  const root = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const people = [
    ...new Map(
      [{ profile, clientId: 'self', view: 'canvas' }, ...peers].map((p) => [
        p.profile.id,
        p,
      ]),
    ).values(),
  ]
  useEffect(() => {
    if (!panel) return
    opener.current = document.activeElement as HTMLElement
    const dialog = root.current?.querySelector<HTMLElement>('[role="dialog"]')
    dialog?.querySelector<HTMLElement>('input,button')?.focus()
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanel(null)
        opener.current?.focus()
      }
      if (event.key === 'Tab' && dialog) {
        const fields = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not(:disabled),input,textarea',
          ),
        )
        if (event.shiftKey && document.activeElement === fields[0]) {
          event.preventDefault()
          fields.at(-1)?.focus()
        } else if (
          !event.shiftKey &&
          document.activeElement === fields.at(-1)
        ) {
          event.preventDefault()
          fields[0]?.focus()
        }
      }
    }
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setPanel(null)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', outside)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', outside)
    }
  }, [panel, setPanel])
  const open = (next: typeof panel) => {
    opener.current = document.activeElement as HTMLElement
    setError('')
    setCopied(false)
    if (next === 'profile') {
      setName(profile.name)
      setAvatar(profile.avatar)
    }
    setPanel(panel === next ? null : next)
  }
  return (
    <div className="collaboration-bar" ref={root}>
      <span
        className={`connection-dot ${connected ? 'online' : ''}`}
        title={
          connected
            ? 'Live collaboration connected'
            : 'Reconnecting to collaborators'
        }
        aria-label={
          connected
            ? 'Live collaboration connected'
            : 'Reconnecting to collaborators'
        }
      />
      <button
        className="people-button"
        aria-label={`${people.length} people in studio`}
        onClick={() => open('people')}
      >
        <Users size={16} />
        <span>{people.length}</span>
      </button>
      <button
        className="profile-button"
        aria-label={`Edit profile for ${profile.name}`}
        onClick={() => open('profile')}
      >
        <Avatar profile={profile} />
        <span>{profile.name}</span>
      </button>
      {panel && (
        <section
          className="collaboration-popover"
          role="dialog"
          aria-label={
            panel === 'profile'
              ? 'Your profile'
              : panel === 'people'
                ? 'People and invites'
                : 'Team activity'
          }
        >
          <div className="collaboration-popover-heading">
            <strong>
              {panel === 'profile'
                ? 'Make yourself at home.'
                : panel === 'people'
                  ? 'Better together.'
                  : 'While we work.'}
            </strong>
            <button
              className="icon-button"
              aria-label="Close collaboration panel"
              onClick={() => {
                setPanel(null)
                opener.current?.focus()
              }}
            >
              <X size={17} />
            </button>
          </div>
          {panel === 'profile' ? (
            <>
              <form
                onSubmit={async (event) => {
                  event.preventDefault()
                  setBusy(true)
                  setError('')
                  try {
                    const result = await request<{ profile: Profile }>(
                      '/api/profile',
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, avatar }),
                      },
                    )
                    onProfile(result.profile)
                    setPanel(null)
                    opener.current?.focus()
                  } catch (err) {
                    setError(String(err))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <div className="profile-picture-editor">
                  <Avatar
                    profile={{ ...profile, name: name || profile.name, avatar }}
                  />
                  <label className="button">
                    Change picture
                    <input
                      aria-label="Upload profile picture"
                      className="visually-hidden"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        event.target.value = ''
                        if (!file) return
                        setBusy(true)
                        try {
                          setAvatar(await avatarFrom(file))
                          setError('')
                        } catch (err) {
                          setError(String(err))
                        } finally {
                          setBusy(false)
                        }
                      }}
                    />
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setAvatar('')}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <label>
                  Display name
                  <input
                    aria-label="Display name"
                    maxLength={60}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </label>
                <p className="collaboration-hint">
                  Your name and picture appear beside your cursor and in the
                  team.
                </p>
                <button
                  className="button primary"
                  disabled={busy || !name.trim()}
                >
                  {busy ? 'Saving…' : 'Save profile'}
                </button>
              </form>
              <AccountConnection onProfile={onProfile} />
            </>
          ) : panel === 'people' ? (
            <>
              <div className="people-list" data-follow-controls>
                {[
                  {
                    profile,
                    clientId: 'self',
                    view: 'canvas',
                    following: null,
                  },
                  ...peers,
                ].map((person) => (
                  <button
                    className="follow-person"
                    key={person.clientId}
                    disabled={
                      person.clientId === 'self' ||
                      !!person.following ||
                      !connected
                    }
                    aria-label={
                      person.clientId === 'self'
                        ? `${person.profile.name} (you)`
                        : `Follow ${person.profile.name}`
                    }
                    aria-pressed={followId === person.clientId}
                    onClick={() => {
                      onFollow(
                        followId === person.clientId ? null : person.clientId,
                      )
                      setPanel(null)
                    }}
                  >
                    <Avatar profile={person.profile} />
                    <span>
                      <strong>
                        {person.profile.name}
                        {person.clientId === 'self'
                          ? ' (you)'
                          : person.profile.id === profile.id
                            ? ' (another tab)'
                            : ''}
                      </strong>
                      <small>
                        {person.clientId === 'self'
                          ? 'This browser'
                          : person.following
                            ? 'Following another person'
                            : person.view === 'canvas'
                              ? 'On the canvas'
                              : `Viewing ${person.view}`}
                      </small>
                    </span>
                    {person.clientId !== 'self' && !person.following && (
                      <small>
                        {followId === person.clientId ? 'Following' : 'Follow'}
                      </small>
                    )}
                  </button>
                ))}
              </div>
              <button
                className="button primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  try {
                    const result = await request<{ token: string }>(
                      '/api/invites',
                      {
                        method: 'POST',
                        headers: workspaceHeaders(workspaceId),
                      },
                    )
                    setInvite(`${location.origin}/#invite=${result.token}`)
                    setCopied(false)
                  } catch (err) {
                    setError(String(err))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <Link size={14} />
                Create invite link
              </button>
              {invite && (
                <label className="invite-output">
                  Single-use link · expires in 24 hours
                  <input
                    aria-label="Invite link"
                    readOnly
                    value={invite}
                    onFocus={(event) => event.target.select()}
                  />
                  <button
                    className="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(invite)
                        setCopied(true)
                      } catch {
                        setError('Select and copy the invite link above.')
                      }
                    }}
                  >
                    {copied ? <Check size={14} /> : <Link size={14} />}
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                </label>
              )}
              <p className="collaboration-hint">
                Invitees can edit this workspace and invite others. Share the
                address of the hosted studio when joining from another device.
              </p>
            </>
          ) : (
            <div className="team-activity-list">
              {!activity.length ? (
                <p>No edits yet. Make a change to start the shared history.</p>
              ) : (
                activity.map((item) => (
                  <div key={item.id}>
                    <span className="activity-seed" />
                    <span>
                      <strong>{item.name}</strong>
                      <p>{item.message}</p>
                      <small>
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </section>
      )}
    </div>
  )
}
