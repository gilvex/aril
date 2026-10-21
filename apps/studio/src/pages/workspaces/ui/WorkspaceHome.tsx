import { Text } from '@/shared/ui/Text.tsx'
import { InvitationInbox } from '@/features/invitations/index.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
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
        <a className="brand" href="/app">
          <ProductLogo />
          <Text as="span">{getProductBranding().productName}</Text>
        </a>
        <div className="workspace-home-account">
          {!profile.guestExpiresAt && !isDemoMode() && <InvitationInbox />}
          <WorkspaceAccountMenu profile={profile} onProfile={onProfile} />
        </div>
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
          <Text as="p" className="workspace-notice" role="status">
            {notice}
          </Text>
        )}
        {hostedOrigin && !profile.guestExpiresAt && (
          <div className="workspace-hosted">
            <Text as="span">{t('Your shared studio is ready online.')}</Text>
            <button className="button" disabled={busy} onClick={openHosted}>
              <Text>{t('Open hosted studio')}</Text>
              <ArrowUpRight size={15} />
            </button>
          </div>
        )}
        {error && !creating && !state.management && (
          <div className="workspace-list-error" role="alert">
            <Text as="p">{error}</Text>
            <button className="button" onClick={state.retry}>
              <Text>{t('Try again')}</Text>
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
            <Text>{t('New workspace')}</Text>
          </button>
        )}
      </footer>
      <WorkspaceDialogs {...library} />
    </main>
  )
}
