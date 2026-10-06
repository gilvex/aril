import { useTranslation } from '@/shared/i18n/index.ts'
import { useThemePreference } from '@/shared/model/useThemePreference.ts'
import type { ThemePreference } from '@/shared/types/themePreference.ts'
import { setThemePreference } from '@/shared/utils/setThemePreference.ts'
import { Monitor, Moon, Sun } from 'lucide-react'

export function ThemePicker() {
  const { t } = useTranslation()

  const preference = useThemePreference()
  const Icon =
    preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor
  return (
    <label className="theme-picker">
      <span>
        <Icon size={16} /> {t('Appearance')}
      </span>
      <select
        aria-label={t('Appearance')}
        value={preference}
        onChange={(event) =>
          setThemePreference(event.target.value as ThemePreference)
        }
      >
        <option value="system">{t('System')}</option>
        <option value="light">{t('Light')}</option>
        <option value="dark">{t('Dark')}</option>
      </select>
    </label>
  )
}
