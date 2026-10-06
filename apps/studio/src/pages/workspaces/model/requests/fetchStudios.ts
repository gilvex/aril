import type { StudioSummary } from '@pomegranate/domain/studios'
import { request } from '../../../../shared/api/request.ts'
export function fetchStudios(signal: AbortSignal) {
  return request<StudioSummary[]>('/api/studios', { signal })
}
