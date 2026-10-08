import { useCallback } from 'react'
import { RadioGroup } from 'vagabond-ui/radio-group'
import { AccentOptionCard } from './AccentOptionCard.tsx'
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
      <RadioGroup
        value={preference}
        onValueChange={choose}
        className="accent-options"
        aria-label={t('Accent color')}
      >
        {accentOptions.map((option) => (
          <AccentOptionCard
            key={option.id}
            option={option}
            selected={preference === option.id}
          />
        ))}
      </RadioGroup>
    </section>
  )
}
