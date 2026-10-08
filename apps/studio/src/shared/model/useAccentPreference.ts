import { useSyncExternalStore } from 'react'
import { accentStore } from './accentStore.ts'
export function useAccentPreference() {
  return useSyncExternalStore(
    accentStore.subscribe,
    () => accentStore.getState().value,
  )
}
