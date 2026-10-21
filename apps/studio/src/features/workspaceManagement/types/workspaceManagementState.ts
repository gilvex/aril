import type { WorkspaceManagement } from '@/entities/studio/index.ts'
export type WorkspaceManagementState = {
  management: WorkspaceManagement | null
  name: string
  busy: boolean
  error: string
}
