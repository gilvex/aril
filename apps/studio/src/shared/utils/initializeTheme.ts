import { preferenceState } from '../config/preferenceState.ts'
import { key } from '../config/themeKey.ts'
import { media } from '../config/themeMedia.ts'
import { readPreference } from './readPreference.ts'
import { apply } from './themeApply.ts'
export function initializeTheme() {
  apply()
  media.addEventListener('change', apply)
  window.addEventListener('storage', (change) => {
    if (change.key !== key && change.key !== null) return
    preferenceState.value = readPreference()
    apply()
  })
}
