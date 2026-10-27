import { ContextMenu } from 'radix-ui'
import { useCallback } from 'react'
import type { EditorMenuProps } from '../types/editorMenuProps.ts'
import './editorMenu.css'
export function EditorContextMenu({
  children,
  actions,
  label,
  disabled,
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
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild disabled={disabled}>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal
        container={(document.fullscreenElement as HTMLElement) || undefined}
      >
        <ContextMenu.Content
          className="editor-menu"
          aria-label={label}
          collisionPadding={8}
          onCloseAutoFocus={restoreFocus}
        >
          {actions.map((action) => (
            <ContextMenu.Item
              key={action.id}
              className={`editor-menu-item${action.danger ? ' danger' : ''}${action.separator ? ' separated' : ''}`}
              disabled={action.disabled}
              onSelect={action.run}
            >
              <span>{action.label}</span>
              {action.shortcut && <kbd>{action.shortcut}</kbd>}
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
