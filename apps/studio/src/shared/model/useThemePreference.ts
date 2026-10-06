import { preferenceState } from '@/shared/config/preferenceState.ts'
import { subscribe } from '@/shared/utils/themeSubscribe.ts'
import { useSyncExternalStore } from 'react'
export function useThemePreference() {
  return useSyncExternalStore(subscribe, () => preferenceState.value)
}
