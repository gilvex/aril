import { Text } from '@/shared/ui/Text.tsx'
import { Check, PencilLine, Plus, Trash2, Search } from 'lucide-react'
import './boardPicker.css'
import { BoardPickerList } from './BoardPickerList.tsx'

import type { BoardPickerPopoverProps } from '../types/boardPickerPopoverProps.ts'
export function BoardPickerPopover({
  t,
  query,
  setQuery,
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
  const visibleBoards = boards.filter((item) =>
    item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  )
  return (
    <div
      id="board-picker"
      className={
        'board-picker-popover' + (boards.length > 6 ? ' is-searchable' : '')
      }
      aria-label={t('Boards')}
    >
      {boards.length > 6 && (
        <Text as="label" className="board-picker-search">
          <Search size={15} aria-hidden="true" />
          <input
            autoFocus
            type="search"
            aria-label={t('Find a board')}
            placeholder={t('Find a board')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Text>
      )}
      {!visibleBoards.length && (
        <Text as="p" className="board-picker-empty" role="status">
          {t('No matching boards.')}
        </Text>
      )}
      <BoardPickerList
        boards={visibleBoards}
        board={board}
        onBoard={onBoard}
        setOpen={setOpen}
        present={present}
      />
      <div className="board-picker-options">
        <button onClick={createBoard}>
          <Plus size={15} />
          <Text>{t('New board')}</Text>
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
            <Text>{t('Rename board')}</Text>
          </button>
        )}
        <button disabled={boards.length < 2} onClick={deleteBoard}>
          <Trash2 size={15} />
          <Text>{t('Delete current board')}</Text>
        </button>
      </div>
    </div>
  )
}
