import { controlBounds } from './controlBounds.ts'
export function findControl(
  root: HTMLElement,
  scopeId: string,
  target: string,
) {
  const scope =
    scopeId === '$root'
      ? root
      : Array.from(
          document.querySelectorAll<HTMLElement>('[data-collaboration-scope]'),
        ).find(
          (item) =>
            item.dataset.collaborationScope === scopeId &&
            item.getClientRects().length > 0,
        )
  if (!scope) return null
  let element: Element = scope
  if (target.startsWith('name:')) {
    const [, tag, ...name] = target.split(':')
    if (!['input', 'textarea', 'button', 'select'].includes(tag)) return null
    const found = scope.querySelector(
      `${tag}[name="${CSS.escape(name.join(':'))}"]`,
    )
    if (!found) return null
    element = found
  } else
    for (const part of target.split('/').filter(Boolean)) {
      const [tag, index] = part.split(':')
      const child = element.children[Number(index)]
      if (!child || child.tagName.toLowerCase() !== tag) return null
      element = child
    }
  if (
    !(element instanceof HTMLElement) ||
    !element.getClientRects().length ||
    element.closest(
      '[data-collaboration-private],.studio-settings,.collaboration-popover,[inert]',
    )
  )
    return null
  return controlBounds(element) ? element : null
}
