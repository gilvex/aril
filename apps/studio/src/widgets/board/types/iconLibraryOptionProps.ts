import type { LucideIcon } from 'lucide-react'
import type { Idea } from '@aril/domain/workspace'
export type IconLibraryOptionProps = {
  id: Idea['data']['icon']
  label: string
  icon: LucideIcon
  selected: boolean
  size: number
  choose: (id: Idea['data']['icon']) => void
}
