import { getProductBranding } from '@/shared/deploymentSettings/index.ts'
import { ProductLogo } from '@/shared/ui/index.tsx'
import { ArrowUpRight, Plus } from 'lucide-react'
import { InstallApp } from '@/features/installApp/index.ts'
import { WorkspaceAccountMenu } from '@/widgets/collaboration/index.ts'
import { LoadingSkeleton } from '@/shared/ui/index.tsx'
import type { WorkspaceHomeProps } from '../types/workspaceHomeProps.ts'
import { WorkspaceGrid } from './WorkspaceGrid.tsx'
import { WorkspaceDialogs } from './WorkspaceDialogs.tsx'
import { WorkspaceToolbar } from './WorkspaceToolbar.tsx'
import { useWorkspaceLibrary } from '../model/useWorkspaceLibrary.ts'
import { WorkspaceEmptyState } from './WorkspaceEmptyState.tsx'
import './workspaces.css'

export function WorkspaceHome({
  profile,
  onProfile,
  onOpen,
  onJoin,
  onStudiosChanged,
  notice,
}: WorkspaceHomeProps) {
  const library = useWorkspaceLibrary({
    profile,
    onProfile,
    onOpen,
    notice,
    onStudiosChanged,
  })
  const { t, state, visits, visible, create, openHosted, manage } = library
  const { studios, search, sort, creating, busy, error, hostedOrigin } = state
  return (
    <main className="workspace-home workspace-library">
      <header className="workspace-library-header">
        <a className="brand" href="/">
          <ProductLogo />
          <span>{getProductBranding().productName}</span>
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
          onJoin={!profile.guestExpiresAt ? onJoin : undefined}
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
        {error && !creating && !state.management && (
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
        <WorkspaceGrid
          studios={visible}
          visits={visits}
          onOpen={onOpen}
          onManage={manage}
        />
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
      <WorkspaceDialogs {...library} />
    </main>
  )
}
