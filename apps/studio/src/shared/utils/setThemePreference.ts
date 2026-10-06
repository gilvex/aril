import { preferenceState } from '../config/preferenceState.ts'
import { key } from '../config/themeKey.ts'
import type { ThemePreference } from '../types/themePreference.ts'
import { apply } from './themeApply.ts'
export function setThemePreference(next: ThemePreference) {
  preferenceState.value = next
  try {
    localStorage.setItem(key, next)
  } catch {
    /* Keep working when storage is unavailable. */
  }
  apply()
}
