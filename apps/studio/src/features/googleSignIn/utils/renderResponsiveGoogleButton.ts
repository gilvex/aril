import type { GoogleApi } from '../types/googleApi.ts'

export function renderResponsiveGoogleButton(
  element: HTMLElement,
  api: GoogleApi,
  locale: string,
) {
  let previousWidth = 0
  let frame = 0
  const render = () => {
    // Measure before scaling so repeated resizes cannot shrink the button.
    const width = Math.min(400, element.clientWidth)
    if (width < 1) return
    element.style.setProperty(
      '--google-sdk-scale-x',
      String(element.clientWidth / width),
    )
    if (width === previousWidth) return
    previousWidth = width
    element.replaceChildren()
    api.accounts.id.renderButton(element, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'center',
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
