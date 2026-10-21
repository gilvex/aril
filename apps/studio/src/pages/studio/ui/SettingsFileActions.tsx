import { useCallback, type SubmitEvent } from 'react'
import {
  WorkspaceActions,
  WorkspaceManageDialog,
  useWorkspaceManagement,
} from '@/features/workspaceManagement/index.ts'
import type { StudioContentProps } from '../types/studioContentProps.ts'

export function SettingsFileActions({
  studio,
  state,
  multiplayer,
  onOpenWorkspace,
  onWorkspaces,
  onCloseWorkspace,
}: StudioContentProps) {
  const { management, name, busy, error, manage, close, setName, save } =
    useWorkspaceManagement()
  const submit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      const updated = await save(state.flush)
      if (updated === undefined) return
      if (updated) onOpenWorkspace(updated)
      else {
        onCloseWorkspace?.(studio.id)
        onWorkspaces(multiplayer.profile)
      }
    },
    [
      save,
      state.flush,
      onOpenWorkspace,
      onCloseWorkspace,
      onWorkspaces,
      studio.id,
      multiplayer.profile,
    ],
  )
  return (
    <>
      <WorkspaceActions studio={studio} onManage={manage} />
      {management && (
        <WorkspaceManageDialog
          management={management}
          name={name}
          busy={busy}
          error={error}
          onName={setName}
          onClose={close}
          onSubmit={submit}
        />
      )}
    </>
  )
}
