import type { SelectChange } from '@/shared/types/selectChange.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'

export function LanguagePicker() {
  const { t, i18n } = useTranslation()
  const changeLanguage = useCallback(
    (event: SelectChange) => {
      void i18n.changeLanguage(event.target.value)
    },
    [i18n],
  )
  return (
    <label className="theme-picker">
      <span>{t('Language')}</span>
      <StudioSelect
        aria-label={t('Language')}
        value={i18n.resolvedLanguage || 'en'}
        onChange={changeLanguage}
      >
        <option value="en" lang="en">
          English
        </option>
        <option value="ru" lang="ru">
          Русский
        </option>
      </StudioSelect>
    </label>
  )
}
