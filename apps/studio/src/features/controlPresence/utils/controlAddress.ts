export function controlAddress(element: Element, root: HTMLElement) {
  const scope =
    element.closest<HTMLElement>('[data-collaboration-scope]') || root
  if (
    element.closest(
      '[data-collaboration-private],.studio-settings,.collaboration-popover,[data-follow-controls]',
    )
  )
    return null
  if ((scope.dataset.collaborationScope || '').length > 500) return null
  const name = element.getAttribute('name')
  if (
    name &&
    scope.querySelectorAll(
      `${element.tagName.toLowerCase()}[name="${CSS.escape(name)}"]`,
    ).length === 1
  )
    return {
      scope: scope.dataset.collaborationScope || '$root',
      target: `name:${element.tagName.toLowerCase()}:${name}`,
    }
  const parts: string[] = []
  let current: Element | null = element
  while (current && current !== scope && parts.length < 16) {
    const parent: Element | null = current.parentElement
    if (!parent) return null
    parts.unshift(
      `${current.tagName.toLowerCase()}:${Array.from(parent.children).indexOf(current)}`,
    )
    current = parent
  }
  if (current !== scope) return null
  return {
    scope: scope.dataset.collaborationScope || '$root',
    target: parts.join('/'),
  }
}
