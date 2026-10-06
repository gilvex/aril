import { sessionTokenKey } from '@/shared/config/sessionTokenKey.ts'
import { sessionChangeKey } from '@/shared/config/sessionChangeKey.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import type { AccountAction } from '../types/accountAction.ts'

export function finishLogout(mode: AccountAction) {
  if (isDemoMode()) {
    location.assign('/')
    return
  }
  try {
    window.google?.accounts.id.disableAutoSelect?.()
  } catch {
    /* The studio session is already revoked. */
  }
  try {
    localStorage.removeItem(sessionTokenKey)
    localStorage.setItem(sessionChangeKey, crypto.randomUUID())
  } catch {
    /* Cookie-only browsers still return to sign-in. */
  }
  const invite = new URLSearchParams(location.hash.slice(1)).get('invite')
  const hash = invite ? `#${new URLSearchParams({ invite })}` : ''
  location.replace(`${mode === 'switch' ? '/?account=switch' : '/'}${hash}`)
}
