import type { ThemePreference } from '@/shared/types/themePreference.ts'
import { readPreference } from '@/shared/utils/readPreference.ts'
export const preferenceState: { value: ThemePreference } = {
  value: readPreference(),
}
