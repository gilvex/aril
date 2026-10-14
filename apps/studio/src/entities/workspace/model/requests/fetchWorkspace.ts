import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import type { Envelope } from '@aril/domain/workspace'
export function fetchWorkspace(workspaceId: string) {
  return request<Envelope>('/api/workspace', {
    headers: workspaceHeaders(workspaceId),
  })
}
