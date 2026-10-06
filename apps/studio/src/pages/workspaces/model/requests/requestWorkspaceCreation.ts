import { request } from '@/shared/api/request.ts'
import type { StudioSummary } from '@pomegranate/domain/studios'
export function requestWorkspaceCreation(name: string) {
  return request<StudioSummary>('/api/studios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim() }),
  })
}
