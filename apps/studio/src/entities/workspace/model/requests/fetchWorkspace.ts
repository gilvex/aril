import type { Envelope } from '@pomegranate/domain/workspace'
import { request } from '../../../../shared/api/request.ts'
import { workspaceHeaders } from '../../../../shared/api/workspaceHeaders.ts'
export function fetchWorkspace(workspaceId: string) {
  return request<Envelope>('/api/workspace', {
    headers: workspaceHeaders(workspaceId),
  })
}
