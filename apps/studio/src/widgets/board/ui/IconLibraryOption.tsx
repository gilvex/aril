import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { Check } from 'lucide-react'
import type { IconLibraryOptionProps } from '../types/iconLibraryOptionProps.ts'
export function IconLibraryOption({
  id,
  label,
  icon: Icon,
  selected,
  size,
  choose,
}: IconLibraryOptionProps) {
  const select = useCallback(() => choose(id), [choose, id])
  return (
    <button
      type="button"
      className="icon-library-option"
      aria-pressed={selected}
      title={label}
      onClick={select}
    >
      <Icon size={size} aria-hidden="true" />
      <Text as="span">{label}</Text>
      {selected && (
        <Check className="icon-library-check" size={12} aria-hidden="true" />
      )}
    </button>
  )
}
