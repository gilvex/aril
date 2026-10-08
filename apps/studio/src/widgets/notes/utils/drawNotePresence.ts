import type { Presence } from '@pomegranate/domain/collaboration'
import { noteTextRange } from './noteTextRange.ts'
import { noteBodyKey } from './noteBodyKey.ts'

export function drawNotePresence(
  overlay: HTMLElement,
  element: HTMLElement,
  mirror: HTMLElement | null,
  peers: Presence[],
  id: string,
  body: string,
) {
  overlay.replaceChildren()
  const edit = element instanceof HTMLTextAreaElement
  const content = edit ? mirror : element
  if (!content) return
  if (edit) {
    const style = getComputedStyle(element)
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
    ]) {
      content.style.setProperty(property, style.getPropertyValue(property))
    }
    content.style.width = `${element.clientWidth}px`
    content.textContent = body + '\u200b'
    content.style.transform = `translate(${-element.scrollLeft}px, ${-element.scrollTop}px)`
  }
  const bounds = overlay.getBoundingClientRect()
  const key = noteBodyKey(body)
  const text = edit ? body : element.textContent || ''
  for (const peer of peers) {
    const note = peer.note
    if (
      peer.view !== 'notes' ||
      !note ||
      note.id !== id ||
      note.bodyKey !== key ||
      Date.now() - peer.seenAt > 15000
    )
      continue
    const add = (
      className: string,
      x: number,
      y: number,
      width: number,
      height: number,
      label = '',
    ) => {
      const marker = document.createElement('span')
      marker.className = className
      Object.assign(marker.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        '--peer-color': peer.profile.color,
      })
      marker.style.setProperty('--peer-color', peer.profile.color)
      marker.dataset.name = label
      marker.textContent = label
      overlay.append(marker)
    }
    if (note.selection) {
      let { start, end } = note.selection
      if (note.surface !== (edit ? 'edit' : 'read')) {
        const quote = note.selection.quote
        start = quote ? text.indexOf(quote) : -1
        end = start + quote.length
        if (start < 0 || text.indexOf(quote, end) >= 0) continue
      }
      const range =
        end <= text.length ? noteTextRange(content, start, end) : null
      const rects = range ? Array.from(range.getClientRects()) : []
      for (const rect of rects)
        add(
          'note-peer-selection',
          rect.left - bounds.left,
          rect.top - bounds.top,
          Math.max(rect.width, 2),
          rect.height,
        )
      const last = rects.at(-1)
      if (last)
        add(
          'note-peer-caret',
          last.right - bounds.left,
          last.top - bounds.top,
          2,
          last.height,
          peer.profile.name,
        )
    }
    if (note.pointer && note.surface === (edit ? 'edit' : 'read')) {
      add(
        'note-peer-pointer',
        note.pointer.x * element.clientWidth,
        note.pointer.y * element.scrollHeight - element.scrollTop,
        12,
        18,
        `↖ ${peer.profile.name}`,
      )
    }
  }
}
