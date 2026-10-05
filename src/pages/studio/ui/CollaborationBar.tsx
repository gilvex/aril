import { useEffect, useRef, useState } from 'react'
import { Activity as ActivityIcon, Check, Link, Users, X } from 'lucide-react'
import { request, workspaceHeaders } from '../../../shared/api/workspace'
import { GoogleSignIn } from '../../../shared/ui/GoogleSignIn'
import type {
  Activity,
  Presence,
  Profile,
} from '../../../../domain/collaboration'

export function Avatar({ profile }: { profile: Profile }) {
  return (
    <span className="person-avatar" style={{ background: profile.color }}>
      {profile.avatar ? (
        <img src={profile.avatar} alt="" />
      ) : (
        profile.name.trim().slice(0, 2).toUpperCase()
      )}
    </span>
  )
}
export function PresenceAvatars({ profiles }: { profiles: Profile[] }) {
  const people = [
    ...new Map(profiles.map((profile) => [profile.id, profile])).values(),
  ]
  if (!people.length) return null
  const names = people.map((profile) => profile.name).join(', ')
  return (
    <span
      className="tab-presence"
      role="img"
      aria-label={`${names} viewing here`}
      title={`${names} viewing here`}
    >
      {people.slice(0, 3).map((profile) => (
        <Avatar key={profile.id} profile={profile} />
      ))}
      {people.length > 3 && (
        <span className="tab-presence-more">+{people.length - 3}</span>
      )}
    </span>
  )
}
async function avatarFrom(file: File): Promise<string> {
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error('Choose a PNG, JPEG, or WebP under 5 MB.')
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 192
    canvas.height = 192
    const context = canvas.getContext('2d')!
    const side = Math.min(image.width, image.height)
    context.drawImage(
      image,
      (image.width - side) / 2,
      (image.height - side) / 2,
      side,
      side,
      0,
      0,
      192,
      192,
    )
    return canvas.toDataURL('image/webp', 0.82)
  } finally {
    URL.revokeObjectURL(url)
  }
}
type Props = {
  workspaceId: string
  profile: Profile
  peers: Presence[]
  activity: Activity[]
  connected: boolean
  onProfile: (profile: Profile) => void
}
export function CollaborationBar({
  workspaceId,
  profile,
  peers,
  activity,
  connected,
  onProfile,
}: Props) {
  const [panel, setPanel] = useState<'profile' | 'people' | 'activity' | null>(
    null,
  )
  const [name, setName] = useState(profile.name)
  const [avatar, setAvatar] = useState(profile.avatar)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [invite, setInvite] = useState('')
  const [copied, setCopied] = useState(false)
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
  }, [panel])
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
        className="icon-button"
        aria-label="Team activity"
        title="Team activity"
        onClick={() => open('activity')}
      >
        <ActivityIcon size={17} />
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
              <div className="people-list">
                {people.map((person) => (
                  <div key={person.profile.id}>
                    <Avatar profile={person.profile} />
                    <span>
                      <strong>
                        {person.profile.name}
                        {person.profile.id === profile.id ? ' (you)' : ''}
                      </strong>
                      <small>
                        {person.profile.id === profile.id
                          ? 'This browser'
                          : person.view === 'canvas'
                            ? 'On the canvas'
                            : `Viewing ${person.view}`}
                      </small>
                    </span>
                  </div>
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

function AccountConnection({
  onProfile,
}: {
  onProfile: (profile: Profile) => void
}) {
  const [account, setAccount] = useState<{ google: { email: string } | null }>()
  const [error, setError] = useState('')
  const refresh = () =>
    request<{ google: { email: string } | null }>('/api/account')
      .then(setAccount)
      .catch((err) => setError(String(err)))
  useEffect(() => {
    void refresh()
  }, [])
  return (
    <section className="account-connection">
      <strong>Keep your access</strong>
      {error && <p className="form-error">{error}</p>}
      {account?.google ? (
        <p>
          Connected to Google as <b>{account.google.email}</b>. Sign in with
          this account to open your workspaces on another device.
        </p>
      ) : account ? (
        <GoogleSignIn
          link
          onSuccess={(profile) => {
            onProfile(profile)
            void refresh()
          }}
        />
      ) : (
        <p>Loading account…</p>
      )}
    </section>
  )
}
