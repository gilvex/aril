import { request } from '@/shared/api/request.ts'
import type { WorkspaceManagement } from '../types/workspaceManagement.ts'
export function requestWorkspaceChange(
  management: WorkspaceManagement,
  name: string,
) {
  return request<void>(
    `/api/studios/${encodeURIComponent(management.studio.id)}`,
    {
      method: management.mode === 'rename' ? 'PATCH' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        management.mode === 'rename'
          ? { name, expectedName: management.studio.name }
          : { name },
      ),
    },
  )
}
