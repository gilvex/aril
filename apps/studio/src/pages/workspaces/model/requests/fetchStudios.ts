import { request } from '@/shared/api/request.ts'
import type { StudioSummary } from '@pomegranate/domain/studios'
export function fetchStudios(signal: AbortSignal) {
  return request<StudioSummary[]>('/api/studios', { signal })
}
