import type { ComponentProps, ReactNode } from 'react'
import type { SelectChange } from './selectChange.ts'
export type StudioSelectProps = Omit<
  ComponentProps<'button'>,
  'value' | 'onChange' | 'children' | 'onInput'
> & {
  value: string
  children: ReactNode
  onChange?: (event: SelectChange) => void
  onInput?: () => void
}
