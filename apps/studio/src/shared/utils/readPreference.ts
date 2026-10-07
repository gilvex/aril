import { key } from '@/shared/config/themeKey.ts'
import type { ThemePreference } from '@/shared/types/themePreference.ts'
export function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(key)
    return saved === 'light' || saved === 'dark' || saved === 'system'
      ? saved
      : 'dark'
  } catch {
    return 'dark'
  }
}
