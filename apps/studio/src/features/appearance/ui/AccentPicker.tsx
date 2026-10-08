import { useCallback } from 'react'
import { Check } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { useTranslation } from '@/shared/i18n/index.ts'
import { accentOptions } from '@/shared/config/accentOptions.ts'
import { useAccentPreference } from '@/shared/model/useAccentPreference.ts'
import { setAccentPreference } from '@/shared/utils/setAccentPreference.ts'
import { isAccentPreference } from '@/shared/utils/isAccentPreference.ts'
import './accentPicker.css'

export function AccentPicker() {
  const { t } = useTranslation()
  const preference = useAccentPreference()
  const choose = useCallback((value: string) => {
    if (isAccentPreference(value)) setAccentPreference(value)
  }, [])
  return (
    <section className="accent-picker" aria-label={t('Accent color')}>
      <h3>{t('Accent color')}</h3>
      <p>
        {t(
          'Choose a color for app controls. Your designs keep their own colors.',
        )}
      </p>
      <ToggleGroup
        type="single"
        value={preference}
        onValueChange={choose}
        className="accent-options"
        aria-label={t('Accent color')}
      >
        {accentOptions.map((option) => (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            className="accent-option"
            aria-label={t(option.label)}
          >
            <span
              className="accent-swatch"
              style={{ backgroundColor: option.color }}
              aria-hidden="true"
            >
              {preference === option.id && <Check size={18} />}
            </span>
            <span>{t(option.label)}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}
