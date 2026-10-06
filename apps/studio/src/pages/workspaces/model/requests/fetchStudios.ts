import { request } from '@/shared/api/request.ts'
import type { StudioOverview } from '@pomegranate/domain/studios'
export function fetchStudios(signal: AbortSignal) {
  return request<StudioOverview[]>('/api/studios/overview', { signal })
}
