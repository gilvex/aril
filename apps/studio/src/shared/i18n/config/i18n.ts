import i18next, { type BackendModule } from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json' with { type: 'json' }

const localeBackend: BackendModule = {
  type: 'backend',
  init() {},
  read(language, _namespace, callback) {
    if (language !== 'ru') return callback(null, en)
    void import('../locales/ru.json', { with: { type: 'json' } })
      .then((module) => callback(null, module.default))
      .catch((error: Error) => callback(error, false))
  },
}

export const i18n = i18next.createInstance()
void i18n
  .use(localeBackend)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    partialBundledLanguages: true,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initAsync: false,
  })
