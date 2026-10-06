import { useTranslation } from '@/shared/i18n/index.ts'
import { useCanvasNavigationHandlers } from '../model/useCanvasNavigationHandlers.tsx'
import { BoardPickerPopover } from './BoardPickerPopover.tsx'

import { PresenceAvatars } from '@/entities/collaboration/index.ts'
import { createCanvasNavigationState } from '@/features/boardNavigation/model/createCanvasNavigationState.ts'
import { useCanvasNavigationModel } from '@/features/boardNavigation/model/useCanvasNavigationModel.ts'
import type { CanvasNavigationProps } from '@/features/boardNavigation/types/canvasNavigationProps.ts'
import { ChevronDown, PanelsTopLeft, Workflow } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function CanvasNavigation({
  board,
  boards,
  mode,
  onBoard,
  onMode,
  onNew,
  onDelete,
  onRename,
  present,
}: CanvasNavigationProps) {
  const { t } = useTranslation()

  const { open, setOpen, renaming, setRenaming, name, setName } =
    useCanvasNavigationModel(() => createCanvasNavigationState(board))

  const root = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open, setOpen])

  const {
    toggleBoardPicker,
    createBoard,
    renameBoard,
    beginRenaming,
    deleteBoard,
  } = useCanvasNavigationHandlers({
    setOpen,
    open,
    setRenaming,
    onNew,
    name,
    onRename,
    toggle,
    setName,
    board,
    onDelete,
  })
  return (
    <div className="floating-board-navigation" ref={root}>
      <button
        ref={toggle}
        className="board-picker-toggle"
        aria-label={t('Choose board: {{name}}', { name: board.name })}
        aria-expanded={open}
        aria-controls="board-picker"
        onClick={toggleBoardPicker}
      >
        <Workflow size={16} />
        <span>{board.name}</span>
        <ChevronDown size={14} />
      </button>
      <div
        className="floating-board-sections"
        role="group"
        aria-label={t('Board section')}
      >
        {(['canvas', 'wireframes'] as const).map((value) => (
          <button
            key={value}
            aria-pressed={mode === value}
            onClick={() => onMode(value)}
          >
            {value === 'canvas' ? (
              <Workflow size={15} />
            ) : (
              <PanelsTopLeft size={15} />
            )}
            <span>{value === 'canvas' ? t('Blueprint') : t('Wireframes')}</span>
            <PresenceAvatars
              limit={1}
              profiles={present
                .filter((p) => p.view === value && p.boardId === board.id)
                .map((p) => p.profile)}
            />
          </button>
        ))}
      </div>
      {open && (
        <BoardPickerPopover
          t={t}
          boards={boards}
          board={board}
          onBoard={onBoard}
          setOpen={setOpen}
          present={present}
          createBoard={createBoard}
          renaming={renaming}
          renameBoard={renameBoard}
          name={name}
          setName={setName}
          beginRenaming={beginRenaming}
          deleteBoard={deleteBoard}
        />
      )}
    </div>
  )
}
