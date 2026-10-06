import { key } from '../config/themeKey.ts'
import type { ThemePreference } from '../types/themePreference.ts'
export function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(key)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}
