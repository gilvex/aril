import { preferenceState } from '@/shared/config/preferenceState.ts'
import { key } from '@/shared/config/themeKey.ts'
import { media } from '@/shared/config/themeMedia.ts'
import { readPreference } from '@/shared/utils/readPreference.ts'
import { apply } from '@/shared/utils/themeApply.ts'
export function initializeTheme() {
  apply()
  media.addEventListener('change', apply)
  window.addEventListener('storage', (change) => {
    if (change.key !== key && change.key !== null) return
    preferenceState.value = readPreference()
    apply()
  })
}
