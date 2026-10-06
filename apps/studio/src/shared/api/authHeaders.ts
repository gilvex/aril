import { sessionTokenKey } from '../config/sessionTokenKey.ts'
export function authHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem(sessionTokenKey)
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}
