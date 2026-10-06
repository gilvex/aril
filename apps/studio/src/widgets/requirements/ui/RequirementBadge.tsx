import { CheckCircle2, Circle, CircleDashed, Flag } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementBadgeProps } from '../types/requirementBadgeProps.ts'
export function RequirementBadge({ value, field }: RequirementBadgeProps) {
  const { t } = useTranslation()
  const Icon =
    field === 'priority'
      ? Flag
      : value === 'Ready'
        ? CheckCircle2
        : value === 'Designing'
          ? CircleDashed
          : Circle
  const tone =
    value === 'Ready'
      ? 'ready'
      : value === 'Designing' || value === 'Should have'
        ? 'progress'
        : value === 'Must have'
          ? 'must'
          : 'quiet'
  return (
    <span className={`req-badge req-tone-${tone}`}>
      <Icon size={14} />
      {t(value)}
    </span>
  )
}
