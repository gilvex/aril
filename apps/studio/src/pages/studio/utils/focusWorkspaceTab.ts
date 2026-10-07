import type { KeyboardEvent } from 'react'

export function focusWorkspaceTab(event: KeyboardEvent<HTMLDivElement>) {
  if (
    !(event.target instanceof HTMLButtonElement) ||
    event.target.role !== 'tab'
  )
    return
  const tabs = [
    ...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  ]
  const index = tabs.indexOf(event.target)
  const next =
    event.key === 'ArrowRight'
      ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft'
        ? (index - 1 + tabs.length) % tabs.length
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? tabs.length - 1
            : null
  if (next !== null) {
    event.preventDefault()
    tabs[next]?.focus()
  }
}
