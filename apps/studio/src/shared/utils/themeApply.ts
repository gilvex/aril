import { preferenceState } from '@/shared/config/preferenceState.ts'
import { event } from '@/shared/config/themeEvent.ts'
import { media } from '@/shared/config/themeMedia.ts'
export function apply() {
  const theme =
    preferenceState.value === 'system'
      ? media.matches
        ? 'dark'
        : 'light'
      : preferenceState.value
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#1e1e1e' : '#f8f7fa')
  window.dispatchEvent(new Event(event))
}
