import { useCallback, type ChangeEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignVariableValueProps } from '../types/designVariableValueProps.ts'
export function DesignVariableValue({
  type,
  value,
  label,
  onChange,
  disabled,
}: DesignVariableValueProps) {
  const { t } = useTranslation()
  const change = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      onChange(
        type === 'boolean'
          ? e.target.checked
          : type === 'number'
            ? Number(e.target.value)
            : e.target.value,
      ),
    [type, onChange],
  )
  return (
    <input
      aria-label={label}
      title={label}
      disabled={disabled}
      type={
        type === 'color'
          ? 'color'
          : type === 'number'
            ? 'number'
            : type === 'boolean'
              ? 'checkbox'
              : 'text'
      }
      value={type === 'boolean' ? undefined : String(value ?? '')}
      checked={type === 'boolean' ? !!value : undefined}
      onChange={change}
      maxLength={12000}
      placeholder={t('Value')}
    />
  )
}
