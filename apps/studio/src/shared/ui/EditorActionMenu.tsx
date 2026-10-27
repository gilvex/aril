import { DropdownMenu } from 'radix-ui'
import {
  DropdownMenu as Menu,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from 'vagabond-ui/dropdown-menu'
import { useCallback } from 'react'
import type { EditorMenuProps } from '../types/editorMenuProps.ts'
import './editorMenu.css'
export function EditorActionMenu({
  children,
  actions,
  label,
  focusAfterClose,
}: EditorMenuProps) {
  const restoreFocus = useCallback(
    (event: Event) => {
      if (focusAfterClose?.current) {
        event.preventDefault()
        focusAfterClose.current.focus()
      }
    },
    [focusAfterClose],
  )
  return (
    <Menu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenu.Portal
        container={(document.fullscreenElement as HTMLElement) || undefined}
      >
        <DropdownMenu.Content
          className="editor-menu"
          aria-label={label}
          sideOffset={5}
          collisionPadding={8}
          onCloseAutoFocus={restoreFocus}
        >
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              className={`editor-menu-item${action.danger ? ' danger' : ''}${action.separator ? ' separated' : ''}`}
              disabled={action.disabled}
              onSelect={action.run}
            >
              <span>{action.label}</span>
              {action.shortcut && <kbd>{action.shortcut}</kbd>}
            </DropdownMenuItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </Menu>
  )
}
