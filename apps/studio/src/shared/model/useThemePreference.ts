import { useSyncExternalStore } from 'react'
import { preferenceState } from '../config/preferenceState.ts'
import { subscribe } from '../utils/themeSubscribe.ts'
export function useThemePreference() {
  return useSyncExternalStore(subscribe, () => preferenceState.value)
}
