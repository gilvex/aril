import { Text } from '@/shared/ui/Text.tsx'
import { StudioSelect } from '@/shared/ui/index.tsx'
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
    <Text as="label" className="theme-picker">
      <Text as="span">
        <Icon size={16} /> {t('Appearance')}
      </Text>
      <StudioSelect
        aria-label={t('Appearance')}
        value={preference}
        onChange={(event) =>
          setThemePreference(event.target.value as ThemePreference)
        }
      >
        <option value="system">{t('System')}</option>
        <option value="light">{t('Light')}</option>
        <option value="dark">{t('Dark')}</option>
      </StudioSelect>
    </Text>
  )
}
