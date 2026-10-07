import { useEffect, useRef } from 'react'
import type { UseStudioFocusManagementProps } from '../types/useStudioFocusManagementProps.ts'
export function useStudioFocusManagement({
  compact,
  modal,
}: UseStudioFocusManagementProps) {
  const sidebarRef = useRef<HTMLElement>(null)
  const actionsMenu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!actionsMenu.current?.contains(event.target as Node))
        actionsMenu.current?.removeAttribute('open')
    }
    const escape = (event: KeyboardEvent) => {
      if (actionsMenu.current?.closest('[hidden]')) return
      if (event.key === 'Escape' && actionsMenu.current?.open) {
        actionsMenu.current.removeAttribute('open')
        actionsMenu.current.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  const mobileMenuToggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!modal || compact) return
    const previous = document.activeElement as HTMLElement | null
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    const selector =
      'button:not(:disabled),input:not(:disabled),select,textarea,a[href]'
    const fields = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(selector) || [])
    const autofocus = dialog?.querySelector<HTMLElement>('[autofocus],input')
    ;(autofocus || fields()[0])?.focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const list = fields()
      const first = list[0]
      const last = list[list.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => {
      document.removeEventListener('keydown', trap)
      previous?.focus()
    }
  }, [modal, compact])
  return { sidebarRef, actionsMenu, mobileMenuToggle }
}
