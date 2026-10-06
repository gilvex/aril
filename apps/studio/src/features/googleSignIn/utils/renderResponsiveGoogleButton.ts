import type { GoogleApi } from '../types/googleApi.ts'

export function renderResponsiveGoogleButton(
  element: HTMLElement,
  api: GoogleApi,
  locale: string,
) {
  let previousWidth = 0
  let frame = 0
  const render = () => {
    const width = Math.min(
      400,
      Math.floor(element.getBoundingClientRect().width),
    )
    if (width < 1 || width === previousWidth) return
    previousWidth = width
    element.replaceChildren()
    api.accounts.id.renderButton(element, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: String(width),
      locale,
    })
  }
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(render)
  })
  observer.observe(element)
  render()
  return () => {
    observer.disconnect()
    cancelAnimationFrame(frame)
  }
}
