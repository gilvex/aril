import { WorkspaceSessions } from './WorkspaceSessions.tsx'
import { AppEntryContent } from './AppEntryContent.tsx'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import { DemoBanner } from './DemoBanner.tsx'
import './demo.css'
import '../toolDocks.css'
import { useSessionChange } from '../model/useSessionChange.ts'
import { SessionChangedScreen } from './SessionChangedScreen.tsx'
import { useAppController } from '../model/useAppController.ts'
import { useAppHandlers } from '../model/useAppHandlers.tsx'
import { InitialLoadingScreen } from './InitialLoadingScreen.tsx'
import { useScrollIndicators } from '../model/useScrollIndicators.ts'
import '../scrollbars.css'

export function App() {
  useScrollIndicators()
  const sessionChanged = useSessionChange()
  const model = useAppController()
  const {
    sessions,
    closeWorkspace,
    legacy,
    studio,
    profile,
    token,
    restoringRoute,
    initial,
    inviteRequired,
    error,
  } = model
  const { openWorkspace, returnToWorkspaces } = useAppHandlers(model)
  const loading =
    !legacy &&
    !error &&
    !inviteRequired &&
    !token &&
    (!profile || restoringRoute || !!(studio && !initial))
  return (
    <>
      <div
        className={`app-content${isDemoMode() ? ' demo-mode' : ''}`}
        inert={loading && !sessionChanged}
      >
        {isDemoMode() && <DemoBanner />}
        {sessionChanged ? (
          <SessionChangedScreen />
        ) : (
          <AppEntryContent model={model} onOpen={openWorkspace} />
        )}
        {!sessionChanged && profile && !inviteRequired && !token && !legacy && (
          <WorkspaceSessions
            sessions={sessions}
            activeId={!loading && studio && initial ? studio.id : null}
            initialProfile={profile}
            onWorkspaces={returnToWorkspaces}
            onOpenWorkspace={openWorkspace}
            onCloseWorkspace={closeWorkspace}
          />
        )}
      </div>
      <InitialLoadingScreen
        loading={loading && !sessionChanged}
        completed={!profile ? 0 : restoringRoute ? 1 : initial ? 3 : 2}
        total={model.startupRoute.workspaceId || studio ? 3 : 1}
      />
    </>
  )
}
