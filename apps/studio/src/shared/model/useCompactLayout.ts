import { useSyncExternalStore } from 'react'
import { query } from '../config/query.ts'
import { subscribe } from '../utils/useCompactLayoutSubscribe.ts'
export function useCompactLayout() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
