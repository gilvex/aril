import { useContext } from 'react'
import { WorkspaceRoleContext } from './workspaceRoleContext.ts'
export function useWorkspaceRole() {
  return useContext(WorkspaceRoleContext)
}
