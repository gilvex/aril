import { ArrowUpRight, Plus } from 'lucide-react'
import { InstallApp } from '@/features/installApp/index.ts'
import { WorkspaceAccountMenu } from '@/widgets/collaboration/index.ts'
import { LoadingSkeleton } from '@/shared/ui/index.tsx'
import type { WorkspaceHomeProps } from '../types/workspaceHomeProps.ts'
import { WorkspaceCard } from './WorkspaceCard.tsx'
import { WorkspaceToolbar } from './WorkspaceToolbar.tsx'
import { WorkspaceCreateDialog } from './WorkspaceCreateDialog.tsx'
import { useWorkspaceLibrary } from '../model/useWorkspaceLibrary.ts'
import { WorkspaceEmptyState } from './WorkspaceEmptyState.tsx'
import './workspaces.css'

export function WorkspaceHome({
  profile,
  onProfile,
  onOpen,
  notice,
}: WorkspaceHomeProps) {
  const { t, state, visits, visible, handleSubmit, create, openHosted } =
    useWorkspaceLibrary({ profile, onProfile, onOpen, notice })
  const {
    studios,
    search,
    sort,
    creating,
    busy,
    error,
    name,
    setName,
    setCreating,
    hostedOrigin,
  } = state
  return (
    <main className="workspace-home workspace-library">
      <header className="workspace-library-header">
        <a className="brand" href="/">
          <img src="/aril.svg" alt="" />
          <span>aril</span>
        </a>
        <WorkspaceAccountMenu profile={profile} onProfile={onProfile} />
      </header>
      <div className="workspace-library-content">
        <WorkspaceToolbar
          canCreate={!profile.guestExpiresAt}
          count={studios?.length}
          search={search}
          sort={sort}
          onSearch={state.setSearch}
          onSort={state.setSort}
          onCreate={create}
        />
        {notice && (
          <p className="workspace-notice" role="status">
            {notice}
          </p>
        )}
        {hostedOrigin && !profile.guestExpiresAt && (
          <div className="workspace-hosted">
            <span>{t('Your shared studio is ready online.')}</span>
            <button className="button" disabled={busy} onClick={openHosted}>
              {t('Open hosted studio')}
              <ArrowUpRight size={15} />
            </button>
          </div>
        )}
        {error && !creating && (
          <div className="workspace-list-error" role="alert">
            <p>{error}</p>
            <button className="button" onClick={state.retry}>
              {t('Try again')}
            </button>
          </div>
        )}
        {!studios && !error && (
          <LoadingSkeleton
            variant="cards"
            label={t('Loading your workspaces…')}
          />
        )}
        <div className="workspace-grid">
          {visible.map((studio) => (
            <WorkspaceCard
              key={studio.id}
              studio={studio}
              visited={visits[studio.id]}
              onOpen={onOpen}
            />
          ))}
        </div>
        {studios && !visible.length && (
          <WorkspaceEmptyState searching={!!search.trim()} />
        )}
      </div>
      <footer className="workspace-library-footer">
        <InstallApp />
        {!profile.guestExpiresAt && (
          <button
            className="button primary workspace-create-mobile"
            onClick={create}
          >
            <Plus size={18} />
            {t('New workspace')}
          </button>
        )}
      </footer>
      {creating && (
        <WorkspaceCreateDialog
          handleSubmit={handleSubmit}
          t={t}
          name={name}
          setName={setName}
          setCreating={setCreating}
          busy={busy}
          error={error}
        />
      )}
    </main>
  )
}
