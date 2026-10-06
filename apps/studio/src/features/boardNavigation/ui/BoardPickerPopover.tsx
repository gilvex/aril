import { Check, PencilLine, Plus, Trash2 } from 'lucide-react'
import { BoardPickerList } from './BoardPickerList.tsx'

import type { BoardPickerPopoverProps } from '../types/boardPickerPopoverProps.ts'
export function BoardPickerPopover({
  t,
  boards,
  board,
  onBoard,
  setOpen,
  present,
  createBoard,
  renaming,
  renameBoard,
  name,
  setName,
  beginRenaming,
  deleteBoard,
}: BoardPickerPopoverProps) {
  return (
    <div
      id="board-picker"
      className="board-picker-popover"
      aria-label={t('Boards')}
    >
      <BoardPickerList
        boards={boards}
        board={board}
        onBoard={onBoard}
        setOpen={setOpen}
        present={present}
      />
      <div className="board-picker-options">
        <button onClick={createBoard}>
          <Plus size={15} />
          {t('New board')}
        </button>
        {renaming ? (
          <form onSubmit={renameBoard}>
            <input
              autoFocus
              aria-label={t('Board name')}
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
            />
            <button aria-label={t('Save board name')} disabled={!name.trim()}>
              <Check size={16} />
            </button>
          </form>
        ) : (
          <button onClick={beginRenaming}>
            <PencilLine size={15} />
            {t('Rename board')}
          </button>
        )}
        <button disabled={boards.length < 2} onClick={deleteBoard}>
          <Trash2 size={15} />
          {t('Delete current board')}
        </button>
      </div>
    </div>
  )
}
