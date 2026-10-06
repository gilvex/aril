import { request } from '../../../../shared/api/request.ts'
export function fetchHostedOrigin(signal: AbortSignal) {
  return request<{ hostedOrigin?: string }>('/api/auth/config', { signal })
}
