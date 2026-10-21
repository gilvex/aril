import { WorkspaceManageDialog } from '@/features/workspaceManagement/index.ts'
import { WorkspaceCreateDialog } from './WorkspaceCreateDialog.tsx'
import type { WorkspaceDialogsProps } from '../types/workspaceDialogsProps.ts'
export function WorkspaceDialogs({
  state,
  t,
  handleSubmit,
  closeManagement,
  submitManagement,
}: WorkspaceDialogsProps) {
  const { management, name, busy, error, setName, creating, setCreating } =
    state
  return (
    <>
      {management && (
        <WorkspaceManageDialog
          management={management}
          name={name}
          busy={busy}
          error={error}
          onName={setName}
          onClose={closeManagement}
          onSubmit={submitManagement}
        />
      )}
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
    </>
  )
}
