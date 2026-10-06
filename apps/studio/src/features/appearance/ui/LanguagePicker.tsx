import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback, type ChangeEvent } from 'react'

export function LanguagePicker() {
  const { t, i18n } = useTranslation()
  const changeLanguage = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      void i18n.changeLanguage(event.target.value)
    },
    [i18n],
  )
  return (
    <label className="theme-picker">
      <span>{t('Language')}</span>
      <select
        aria-label={t('Language')}
        value={i18n.resolvedLanguage}
        onChange={changeLanguage}
      >
        <option value="en" lang="en">
          English
        </option>
        <option value="ru" lang="ru">
          Русский
        </option>
      </select>
    </label>
  )
}
