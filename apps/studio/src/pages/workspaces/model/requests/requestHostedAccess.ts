import { request } from '../../../../shared/api/request.ts'
export function requestHostedAccess() {
  return request<{ url: string }>('/api/hosted-access', { method: 'POST' })
}
