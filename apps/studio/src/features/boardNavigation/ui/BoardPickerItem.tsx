import { PresenceAvatars } from '@/entities/collaboration/index.ts'
import { Check, Workflow } from 'lucide-react'
import { useBoardPickerItemHandlers } from '../model/useBoardPickerItemHandlers.tsx'

import type { BoardPickerItemProps } from '../types/boardPickerItemProps.ts'
export function BoardPickerItem({
  item,
  board,
  onBoard,
  setOpen,
  present,
}: BoardPickerItemProps) {
  const { handleClick, profiles } = useBoardPickerItemHandlers({
    onBoard,
    item,
    setOpen,
    present,
  })
  return (
    <button
      key={item.id}
      aria-current={item.id === board.id ? 'page' : undefined}
      onClick={handleClick}
    >
      <Workflow size={15} />
      <span>{item.name}</span>
      <PresenceAvatars profiles={profiles} />
      {item.id === board.id && <Check size={14} />}
    </button>
  )
}
