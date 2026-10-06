import { useEffect, useRef } from 'react'
import type { UseStudioFocusManagementProps } from '../types/useStudioFocusManagementProps.ts'
export function useStudioFocusManagement({
  compact,
  sidebarOpen,
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
    if (!compact || !sidebarOpen) return
    const toggle = mobileMenuToggle.current
    const panel = sidebarRef.current
    const fields = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),select:not(:disabled),a[href]',
        ) || [],
      ).filter((element) => element.getClientRects().length)
    fields()[0]?.focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const items = fields()
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault()
        items.at(-1)?.focus()
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault()
        items[0]?.focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => {
      document.removeEventListener('keydown', trap)
      toggle?.focus()
    }
  }, [compact, sidebarOpen])

  useEffect(() => {
    if (!modal) return
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
  }, [modal])
  return { sidebarRef, actionsMenu, mobileMenuToggle }
}
