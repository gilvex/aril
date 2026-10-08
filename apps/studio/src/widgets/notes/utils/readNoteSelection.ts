import type { NotePresence } from '@pomegranate/domain/collaboration'

export function readNoteSelection(
  element: HTMLElement,
): NotePresence['selection'] {
  if (element instanceof HTMLTextAreaElement) {
    if (document.activeElement !== element) return null
    const start = element.selectionStart,
      end = element.selectionEnd
    return { start, end, quote: element.value.slice(start, end).slice(0, 2000) }
  }
  const selection = window.getSelection()
  if (
    !selection?.rangeCount ||
    !element.contains(selection.anchorNode) ||
    !element.contains(selection.focusNode)
  )
    return null
  const range = selection.getRangeAt(0)
  const prefix = range.cloneRange()
  prefix.selectNodeContents(element)
  prefix.setEnd(range.startContainer, range.startOffset)
  const start = prefix.toString().length
  return {
    start,
    end: start + range.toString().length,
    quote: range.toString().slice(0, 2000),
  }
}
