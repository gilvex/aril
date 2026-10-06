import { useCallback, useMemo } from 'react'

import type { BoardPickerItemHandlersProps } from '../types/useBoardPickerItemHandlersProps.ts'
export function useBoardPickerItemHandlers({
  onBoard,
  item,
  setOpen,
  present,
}: BoardPickerItemHandlersProps) {
  const handleClick = useCallback<() => void>(() => {
    onBoard(item.id)
    setOpen(false)
  }, [onBoard, item, setOpen])
  const profiles = useMemo(
    () =>
      present
        .filter(
          (p) =>
            p.boardId === item.id && ['canvas', 'wireframes'].includes(p.view),
        )
        .map((p) => p.profile),
    [present, item],
  )
  return { handleClick, profiles }
}
