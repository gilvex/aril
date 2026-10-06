import { request } from '@/shared/api/request.ts'
import type { AccountAction } from '../../types/accountAction.ts'
import { finishLogout } from '../../utils/finishLogout.ts'

export async function logoutSession(mode: AccountAction) {
  await request<void>('/api/auth/logout', {
    method: 'POST',
    headers: { 'x-pomegranate-auth': '1' },
  })
  // Finish even if the profile popover unmounts while the server revokes access.
  finishLogout(mode)
}
