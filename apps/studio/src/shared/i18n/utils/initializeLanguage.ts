import { i18n } from '../config/i18n.ts'

export function initializeLanguage() {
  const storageKey = 'pomegranate-language'
  let language = navigator.language.startsWith('ru') ? 'ru' : 'en'
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'en' || saved === 'ru') language = saved
  } catch {
    /* Preferences are optional when storage is unavailable. */
  }
  document.documentElement.lang = language
  void i18n.changeLanguage(language)
  i18n.on('languageChanged', (next) => {
    document.documentElement.lang = next
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      /* Keep the session preference. */
    }
  })
  window.addEventListener('storage', (event) => {
    if (
      event.key === storageKey &&
      (event.newValue === 'en' || event.newValue === 'ru')
    )
      void i18n.changeLanguage(event.newValue)
  })
}
