import { preferenceState } from '@/shared/config/preferenceState.ts'
import { key } from '@/shared/config/themeKey.ts'
import type { ThemePreference } from '@/shared/types/themePreference.ts'
import { apply } from '@/shared/utils/themeApply.ts'
export function setThemePreference(next: ThemePreference) {
  preferenceState.value = next
  try {
    localStorage.setItem(key, next)
  } catch {
    /* Keep working when storage is unavailable. */
  }
  apply()
}
