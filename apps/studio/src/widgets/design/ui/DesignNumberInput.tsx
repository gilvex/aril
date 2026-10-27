import { useCallback, type ChangeEvent } from 'react'
import type { DesignNumberInputProps } from '../types/designNumberInputProps.ts'
export function DesignNumberInput({
  label,
  value,
  min = -1000000,
  max = 1000000,
  onChange,
}: DesignNumberInputProps) {
  const change = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.value && Number.isFinite(event.target.valueAsNumber))
        onChange(Math.max(min, Math.min(max, event.target.valueAsNumber)))
    },
    [max, min, onChange],
  )
  return (
    <label className="design-number-field" title={label}>
      <span>{label}</span>
      <input
        type="number"
        aria-label={label}
        value={Math.round(value * 100) / 100}
        min={min}
        max={max}
        onChange={change}
      />
    </label>
  )
}
