import { ArrowUpRight, Plus, Workflow } from 'lucide-react'
import { ThemePicker } from '../../../features/appearance/index.ts'
import { createWorkspaceHomeState } from '../model/createWorkspaceHomeState.ts'
import { useWorkspaceHomeModel } from '../model/useWorkspaceHomeModel.ts'
import type { WorkspaceHomeProps } from '../types/workspaceHomeProps.ts'

export function WorkspaceHome({ profile, onOpen, notice }: WorkspaceHomeProps) {
  const {
    studios,
    name,
    setName,
    creating,
    setCreating,
    busy,
    error,
    hostedOrigin,
    createWorkspace,
    openHostedWorkspace,
  } = useWorkspaceHomeModel(() => createWorkspaceHomeState())

  return (
    <main className="workspace-home">
      <header className="workspace-home-header">
        <a className="brand" href="/">
          <img src="/mark.svg" alt="" />
          <span>
            pomegranate<small>Planning studio</small>
          </span>
        </a>
        <div className="workspace-home-preferences">
          <ThemePicker />
          <span className="muted">{profile.name}</span>
        </div>
      </header>
      {hostedOrigin && (
        <div className="workspace-hosted">
          <span>Your shared studio is ready online.</span>
          <button
            className="button"
            disabled={busy}
            onClick={() => openHostedWorkspace()}
          >
            Open hosted studio <ArrowUpRight size={15} />
          </button>
        </div>
      )}
      <div className="workspace-home-title">
        <div>
          <span className="eyebrow">ROOM TO GROW</span>
          <h1>Your workspaces.</h1>
          <p>
            A little space for every big idea. Only workspaces you belong to
            appear here.
          </p>
        </div>
        <button className="button primary" onClick={() => setCreating(true)}>
          <Plus size={16} />
          New workspace
        </button>
      </div>
      {notice && <p role="status">{notice}</p>}
      {creating && (
        <form
          className="workspace-create"
          onSubmit={(event) => {
            event.preventDefault()
            void createWorkspace(name).then((studio) => {
              if (studio) onOpen(studio)
            })
          }}
        >
          <label>
            Workspace name
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="A new idea…"
              maxLength={100}
              required
            />
          </label>
          <p>
            Starts with a blank canvas. Invite collaborators from People when
            you’re ready.
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="button"
              onClick={() => setCreating(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="button primary" disabled={busy || !name.trim()}>
              {busy ? 'Creating…' : 'Create workspace'}
            </button>
          </div>
        </form>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!studios && !error && <p>Loading your workspaces…</p>}
      <div className="workspace-grid">
        {studios?.map((studio) => (
          <button
            key={studio.id}
            className="workspace-card"
            onClick={() => onOpen(studio)}
          >
            <span className="workspace-card-icon">
              <Workflow size={24} />
            </span>
            <span className="workspace-card-role">
              {studio.role === 'owner' ? 'Your workspace' : 'Shared with you'}
            </span>
            <h2>{studio.name}</h2>
            <span className="workspace-card-footer">
              Open planning studio
              <ArrowUpRight size={18} />
            </span>
          </button>
        ))}
      </div>
      {studios?.length === 0 && (
        <p>
          No workspaces yet. Create one or open an invitation to join your team.
        </p>
      )}
    </main>
  )
}
