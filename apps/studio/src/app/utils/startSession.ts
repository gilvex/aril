import { request } from '@/shared/api/request.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import type { Profile } from '@pomegranate/domain/collaboration'

export function startSession() {
  const token = new URLSearchParams(location.hash.slice(1)).get('transfer')
  if (token && !isDemoMode()) {
    history.replaceState(null, '', location.pathname + location.search)
    return request<{ profile: Profile; token?: string }>('/api/auth/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pomegranate-auth': '1',
      },
      body: JSON.stringify({ token }),
    })
  }
  return request<{ profile: Profile; token?: string }>('/api/session')
}
