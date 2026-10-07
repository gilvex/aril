import { WorkspaceHome } from '@/pages/workspaces/index.ts'
import { JoinStudioScreen } from './JoinStudioScreen.tsx'
import { StaleDraftScreen } from './StaleDraftScreen.tsx'
import type { AppEntryContentProps } from '../types/appEntryContentProps.ts'

export function AppEntryContent({ model, onOpen }: AppEntryContentProps) {
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
    googleLinked,
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
  } = model
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
  if (
    !profile ||
    inviteRequired ||
    token ||
    restoringRoute ||
    (studio && !initial)
  )
    return (
      <JoinStudioScreen
        googleLinked={googleLinked}
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
        onProfile={setProfile}
        profile={profile}
        notice={routeNotice}
        onOpen={onOpen}
      />
    )
  return null
}
