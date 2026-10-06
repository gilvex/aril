import type { ReactNode } from 'react'
export type SelectOption = {
  value: string
  label: ReactNode
  disabled?: boolean
  group?: string
}
