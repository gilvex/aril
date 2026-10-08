import type { CanvasViewportController } from '../types/canvasViewportController.ts'

export function observeCanvasViewport(
  element: HTMLElement,
  flow: CanvasViewportController,
) {
  let previous: DOMRect | null = null
  const update = () => {
    const bounds = element.getBoundingClientRect()
    // Cached workspaces can be hidden without unmounting their canvases.
    if (!bounds.width || !bounds.height) {
      previous = null
      return
    }
    const origin = previous
    previous = bounds
    if (!origin || (origin.left === bounds.left && origin.top === bounds.top))
      return
    const viewport = flow.getViewport()
    // Preserve world points on screen, even while a sidebar animates.
    void flow.setViewport({
      ...viewport,
      x: viewport.x + origin.left - bounds.left,
      y: viewport.y + origin.top - bounds.top,
    })
  }
  update()
  const observer = new ResizeObserver(update)
  // Ancestors also catch origin changes when the canvas keeps a fixed size.
  for (
    let parent: HTMLElement | null = element;
    parent;
    parent = parent.parentElement
  )
    observer.observe(parent)
  window.addEventListener('resize', update)
  return {
    update,
    disconnect: () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    },
  }
}
