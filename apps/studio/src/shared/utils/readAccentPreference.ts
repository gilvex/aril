import { accentKey } from '../config/accentKey.ts'
import { isAccentPreference } from './isAccentPreference.ts'
import type { AccentPreference } from '../types/accentPreference.ts'
export function readAccentPreference(): AccentPreference {
  try {
    const saved = localStorage.getItem(accentKey)
    return isAccentPreference(saved) ? saved : 'berry'
  } catch {
    return 'berry'
  }
}
