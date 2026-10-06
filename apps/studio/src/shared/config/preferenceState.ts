import type { ThemePreference } from '../types/themePreference.ts'
import { readPreference } from '../utils/readPreference.ts'
export const preferenceState: { value: ThemePreference } = {
  value: readPreference(),
}
