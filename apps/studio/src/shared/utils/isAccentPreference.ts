import { accentOptions } from '../config/accentOptions.ts'
import type { AccentPreference } from '../types/accentPreference.ts'
export function isAccentPreference(value: unknown): value is AccentPreference {
  return accentOptions.some((option) => option.id === value)
}
