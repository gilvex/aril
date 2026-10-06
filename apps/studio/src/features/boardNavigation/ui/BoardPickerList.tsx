import { BoardPickerItem } from './BoardPickerItem.tsx'

import type { BoardPickerListProps } from '../types/boardPickerListProps.ts'
export function BoardPickerList({
  boards,
  board,
  onBoard,
  setOpen,
  present,
}: BoardPickerListProps) {
  return (
    <div className="board-picker-list">
      {boards.map((item) => (
        <BoardPickerItem
          key={item.id}
          item={item}
          board={board}
          onBoard={onBoard}
          setOpen={setOpen}
          present={present}
        />
      ))}
    </div>
  )
}
