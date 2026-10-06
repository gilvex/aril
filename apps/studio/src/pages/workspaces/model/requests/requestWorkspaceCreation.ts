import type { StudioSummary } from '@pomegranate/domain/studios'
import { request } from '../../../../shared/api/request.ts'
export function requestWorkspaceCreation(name: string) {
  return request<StudioSummary>('/api/studios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim() }),
  })
}
