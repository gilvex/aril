import { controlBounds } from './controlBounds.ts'
import type { ControlPresence } from '@pomegranate/domain/collaboration'
import { controlFingerprint } from './controlFingerprint.ts'
export function controlSelectionRects(
  element: HTMLElement,
  selection: NonNullable<ControlPresence['focus']>['selection'],
) {
  if (
    !selection ||
    !(
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) ||
    controlFingerprint(element.value) !== selection.fingerprint ||
    selection.end > element.value.length ||
    selection.start > selection.end
  )
    return []
  const bounds = element.getBoundingClientRect()
  const clip = controlBounds(element)
  if (!clip) return []
  const style = getComputedStyle(element)
  const mirror = document.createElement('div')
  for (const property of [
    'font',
    'line-height',
    'letter-spacing',
    'padding',
    'border',
    'box-sizing',
    'tab-size',
    'word-break',
    'overflow-wrap',
    'text-align',
    'direction',
  ])
    mirror.style.setProperty(property, style.getPropertyValue(property))
  Object.assign(mirror.style, {
    position: 'fixed',
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${element.offsetWidth}px`,
    height: `${element.offsetHeight}px`,
    transformOrigin: '0 0',
    transform: `scale(${bounds.width / (element.offsetWidth || 1)}, ${bounds.height / (element.offsetHeight || 1)})`,
    whiteSpace: element instanceof HTMLTextAreaElement ? 'pre-wrap' : 'pre',
    visibility: 'hidden',
    pointerEvents: 'none',
    overflow: 'hidden',
  })
  const text = document.createTextNode(element.value + '\u200b')
  mirror.append(text)
  document.body.append(mirror)
  mirror.scrollTop = element.scrollTop
  mirror.scrollLeft = element.scrollLeft
  const range = document.createRange()
  range.setStart(text, selection.start)
  range.setEnd(text, selection.end)
  const rects = Array.from(range.getClientRects())
    .map((rect) => {
      const x = Math.max(clip.x, rect.left),
        y = Math.max(clip.y, rect.top)
      return {
        x,
        y,
        width: Math.max(2, Math.min(clip.x + clip.width, rect.right) - x),
        height: Math.max(0, Math.min(clip.y + clip.height, rect.bottom) - y),
      }
    })
    .filter(
      (rect) =>
        rect.height &&
        rect.x < clip.x + clip.width &&
        rect.y < clip.y + clip.height,
    )
  mirror.remove()
  return rects
}
