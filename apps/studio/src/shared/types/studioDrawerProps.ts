import type { ReactElement, ReactNode } from 'react'
export type StudioDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  trigger?: ReactElement
  className?: string
  side?: boolean
  modal?: boolean
  keepOpenOnInteract?: boolean
}
