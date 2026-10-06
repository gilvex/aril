import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import type { Operation } from '@pomegranate/domain/collaboration'
import type { Envelope } from '@pomegranate/domain/workspace'
export function commitWorkspace(
  workspaceId: string,
  baseRevision: number,
  operations: Operation[],
) {
  return request<Envelope>('/api/workspace', {
    method: 'PATCH',
    headers: {
      ...workspaceHeaders(workspaceId),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: crypto.randomUUID(),
      baseRevision,
      operations,
    }),
  })
}
