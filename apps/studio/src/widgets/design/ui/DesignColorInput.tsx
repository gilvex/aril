import { useCallback, type FocusEvent } from 'react'
import type { DesignColorInputProps } from '../types/designColorInputProps.ts'
export function DesignColorInput({
  label,
  value,
  onChange,
}: DesignColorInputProps) {
  const commit = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const next = event.target.value.trim()
      if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next)
      else event.target.value = value
    },
    [onChange, value],
  )
  return (
    <div className="design-color-field">
      <input
        type="color"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        key={value}
        aria-label={`${label} HEX`}
        defaultValue={value}
        maxLength={7}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
      />
    </div>
  )
}
