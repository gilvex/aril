export function noteTextRange(
  root: HTMLElement,
  start: number,
  end: number,
): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let offset = 0
  let started = false
  while (walker.nextNode()) {
    const node = walker.currentNode
    const length = node.textContent?.length || 0
    if (!started && start <= offset + length) {
      range.setStart(node, Math.max(0, start - offset))
      started = true
    }
    if (started && end <= offset + length) {
      range.setEnd(node, Math.max(0, end - offset))
      return range
    }
    offset += length
  }
  return null
}
