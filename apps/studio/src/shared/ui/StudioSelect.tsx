import { useCallback, useMemo } from 'react'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'vagabond-ui/select'
import { StudioSelectMenu } from './StudioSelectMenu.tsx'
import type { StudioSelectProps } from '../types/studioSelectProps.ts'
import { readSelectOptions } from '../utils/readSelectOptions.ts'
import './studioSelect.css'

export function StudioSelect({
  value,
  children,
  onChange,
  onInput,
  name = '',
  disabled,
  className = '',
  ...props
}: StudioSelectProps) {
  const options = useMemo(() => readSelectOptions(children), [children])
  const change = useCallback(
    (next: string) => {
      onInput?.()
      onChange?.({
        target: { name, value: next === '__aril_empty__' ? '' : next },
      })
    },
    [name, onChange, onInput],
  )
  return (
    <Select
      value={value || '__aril_empty__'}
      onValueChange={change}
      disabled={disabled}
    >
      <SelectTrigger
        {...props}
        name={name || undefined}
        className={`studio-select ${className}`}
      >
        <SelectValue />
      </SelectTrigger>
      <StudioSelectMenu>
        {options.map((option) => (
          <SelectItem
            className="studio-select-option"
            key={option.value}
            value={option.value || '__aril_empty__'}
            disabled={option.disabled}
            textValue={
              typeof option.label === 'string' ? option.label : undefined
            }
          >
            {option.group && <small>{option.group} · </small>}
            {option.label}
          </SelectItem>
        ))}
      </StudioSelectMenu>
    </Select>
  )
}
