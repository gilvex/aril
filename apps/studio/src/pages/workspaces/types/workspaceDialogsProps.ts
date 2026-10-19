import type { useWorkspaceLibrary } from '../model/useWorkspaceLibrary.ts'
export type WorkspaceDialogsProps = Pick<
  ReturnType<typeof useWorkspaceLibrary>,
  'state' | 't' | 'handleSubmit' | 'closeManagement' | 'submitManagement'
>
