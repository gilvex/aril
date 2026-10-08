import { useId } from 'react'
import { Card } from 'vagabond-ui/card'
import { RadioGroupItem } from 'vagabond-ui/radio-group'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { AccentOptionCardProps } from '../types/accentOptionCardProps.ts'

export function AccentOptionCard({ option, selected }: AccentOptionCardProps) {
  const { t } = useTranslation()
  const id = useId()
  return (
    <Card className="accent-option-card" data-selected={selected || undefined}>
      <label className="accent-option-label" htmlFor={id}>
        <span
          className="accent-swatch"
          style={{ backgroundColor: option.color }}
          aria-hidden="true"
        />
        <span className="accent-option-name">{t(option.label)}</span>
        <RadioGroupItem
          className="accent-option-radio"
          id={id}
          value={option.id}
          aria-label={t(option.label)}
        />
      </label>
    </Card>
  )
}
