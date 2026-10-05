import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  PencilLine,
  Plus,
  Trash2,
  Workflow,
  PanelsTopLeft,
} from 'lucide-react'
import type { Board } from '../../../shared/api/workspace'
import type { Presence } from '../../../../domain/collaboration'
import { PresenceAvatars } from './CollaborationBar'

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
}: {
  board: Board
  boards: Board[]
  mode: 'canvas' | 'wireframes'
  onBoard: (id: string) => void
  onMode: (mode: 'canvas' | 'wireframes') => void
  onNew: () => void
  onDelete: () => void
  onRename: (name: string) => void
  present: Pick<Presence, 'profile' | 'view' | 'boardId'>[]
}) {
  const [open, setOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(board.name)
  const openBoardDialog = async (action: () => void) => {
    if (document.fullscreenElement) await document.exitFullscreen()
    action()
  }
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
  }, [open])
  return (
    <div className="floating-board-navigation" ref={root}>
      <button
        ref={toggle}
        className="board-picker-toggle"
        aria-label={`Choose board: ${board.name}`}
        aria-expanded={open}
        aria-controls="board-picker"
        onClick={() => {
          setOpen(!open)
          setRenaming(false)
        }}
      >
        <Workflow size={16} />
        <span>{board.name}</span>
        <ChevronDown size={14} />
      </button>
      <div
        className="floating-board-sections"
        role="group"
        aria-label="Board section"
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
            <span>{value === 'canvas' ? 'Blueprint' : 'Wireframes'}</span>
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
        <div
          id="board-picker"
          className="board-picker-popover"
          aria-label="Boards"
        >
          <div className="board-picker-list">
            {boards.map((item) => (
              <button
                key={item.id}
                aria-current={item.id === board.id ? 'page' : undefined}
                onClick={() => {
                  onBoard(item.id)
                  setOpen(false)
                }}
              >
                <Workflow size={15} />
                <span>{item.name}</span>
                <PresenceAvatars
                  profiles={present
                    .filter(
                      (p) =>
                        p.boardId === item.id &&
                        ['canvas', 'wireframes'].includes(p.view),
                    )
                    .map((p) => p.profile)}
                />
                {item.id === board.id && <Check size={14} />}
              </button>
            ))}
          </div>
          <div className="board-picker-options">
            <button
              onClick={() => {
                setOpen(false)
                void openBoardDialog(onNew)
              }}
            >
              <Plus size={15} />
              New board
            </button>
            {renaming ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (name.trim()) {
                    onRename(name.trim())
                    setRenaming(false)
                    setOpen(false)
                    toggle.current?.focus()
                  }
                }}
              >
                <input
                  autoFocus
                  aria-label="Board name"
                  value={name}
                  maxLength={100}
                  onChange={(e) => setName(e.target.value)}
                />
                <button aria-label="Save board name" disabled={!name.trim()}>
                  <Check size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setName(board.name)
                  setRenaming(true)
                }}
              >
                <PencilLine size={15} />
                Rename board
              </button>
            )}
            <button
              disabled={boards.length < 2}
              onClick={() => {
                setOpen(false)
                void openBoardDialog(onDelete)
              }}
            >
              <Trash2 size={15} />
              Delete current board
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
