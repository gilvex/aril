import { Studio } from '@/pages/studio/index.ts'
import { WorkspaceHome } from '@/pages/workspaces/index.ts'
import { useAppController } from '../model/useAppController.ts'
import { useAppHandlers } from '../model/useAppHandlers.tsx'

import { JoinStudioScreen } from './JoinStudioScreen.tsx'
import { StaleDraftScreen } from './StaleDraftScreen.tsx'
export function App() {
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
  if (legacy)
    return (
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
  if (!profile || token || restoringRoute || (studio && !initial))
    return (
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
  if (!studio || !initial)
    return (
      <WorkspaceHome
        profile={profile}
        notice={routeNotice}
        onOpen={openWorkspace}
      />
    )
  return (
    <Studio
      key={studio.id}
      studio={studio}
      initial={initial}
      recovery={recovery}
      initialProfile={profile}
      onWorkspaces={returnToWorkspaces}
    />
  )
}
