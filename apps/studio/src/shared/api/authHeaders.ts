import { sessionTokenKey } from '@/shared/config/sessionTokenKey.ts'
import { apiTransport } from './apiTransport.ts'
export function authHeaders(): Record<string, string> {
  if (apiTransport.request) return {}
  try {
    const token = localStorage.getItem(sessionTokenKey)
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}
