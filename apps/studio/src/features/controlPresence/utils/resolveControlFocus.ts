/** Portaled dropdown options belong to their trigger's collaboration scope. */
export function resolveControlFocus(element: Element | null): Element | null {
  if (!element) return null
  const menu = element.closest('[data-studio-select-menu]')
  if (!menu) return element
  if (!menu.id) return null
  const triggers = element.ownerDocument.querySelectorAll(
    '[role="combobox"][aria-expanded="true"][aria-controls]',
  )
  return (
    Array.from(triggers).find((trigger) =>
      trigger.getAttribute('aria-controls')?.split(/\s+/).includes(menu.id),
    ) || null
  )
}
