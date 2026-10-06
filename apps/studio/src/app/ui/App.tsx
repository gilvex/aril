import { Studio } from '@/pages/studio/index.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import { DemoBanner } from './DemoBanner.tsx'
import './demo.css'
import { useSessionChange } from '../model/useSessionChange.ts'
import { SessionChangedScreen } from './SessionChangedScreen.tsx'
import { WorkspaceHome } from '@/pages/workspaces/index.ts'
import { useAppController } from '../model/useAppController.ts'
import { useAppHandlers } from '../model/useAppHandlers.tsx'

import { JoinStudioScreen } from './JoinStudioScreen.tsx'
import { StaleDraftScreen } from './StaleDraftScreen.tsx'
import { InitialLoadingScreen } from './InitialLoadingScreen.tsx'
export function App() {
  const sessionChanged = useSessionChange()
  const {
    legacy,
    staleDraftKey,
    setStaleDraftKey,
    setRecovery,
    setInitial,
    setLegacy,
    studio,
    setError,
    profile,
    token,
    restoringRoute,
    initial,
    inviteRequired,
    setBusy,
    name,
    setProfile,
    setInviteRequired,
    setToken,
    setName,
    busy,
    error,
    routeNotice,
    setRouteNotice,
    setStudio,
    recovery,
  } = useAppController()

  const { openWorkspace, returnToWorkspaces } = useAppHandlers({
    setInitial,
    setRecovery,
    setError,
    setRouteNotice,
    setStudio,
    setProfile,
  })
  const loading =
    !legacy &&
    !error &&
    !inviteRequired &&
    !token &&
    (!profile || restoringRoute || !!(studio && !initial))
  let content
  if (legacy)
    content = (
      <StaleDraftScreen
        legacy={legacy}
        staleDraftKey={staleDraftKey}
        setStaleDraftKey={setStaleDraftKey}
        setRecovery={setRecovery}
        setInitial={setInitial}
        setLegacy={setLegacy}
        studio={studio}
        setError={setError}
      />
    )
  else if (!profile || token || restoringRoute || (studio && !initial))
    content = (
      <JoinStudioScreen
        inviteRequired={inviteRequired}
        token={token}
        setBusy={setBusy}
        setError={setError}
        profile={profile}
        name={name}
        setProfile={setProfile}
        setInviteRequired={setInviteRequired}
        setToken={setToken}
        setName={setName}
        busy={busy}
        error={error}
      />
    )
  else if (!studio || !initial)
    content = (
      <WorkspaceHome
        onProfile={setProfile}
        profile={profile}
        notice={routeNotice}
        onOpen={openWorkspace}
      />
    )
  else
    content = (
      <Studio
        key={studio.id}
        studio={studio}
        initial={initial}
        recovery={recovery}
        initialProfile={profile}
        onWorkspaces={returnToWorkspaces}
      />
    )
  return (
    <>
      <div
        className={`app-content${isDemoMode() ? ' demo-mode' : ''}`}
        inert={loading && !sessionChanged}
      >
        {isDemoMode() && <DemoBanner />}
        {sessionChanged ? <SessionChangedScreen /> : content}
      </div>
      <InitialLoadingScreen loading={loading && !sessionChanged} />
    </>
  )
}
