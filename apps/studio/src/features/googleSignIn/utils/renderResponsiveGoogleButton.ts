import type { GoogleApi } from '../types/googleApi.ts'

export function renderResponsiveGoogleButton(
  element: HTMLElement,
  api: GoogleApi,
  locale: string,
) {
  let renderedWidth = 0
  let frame = 0
  const render = () => {
    if (element.clientWidth < 1) return
    // Keep the SDK node (and keyboard focus) alive; only its hit target scales.
    const width = renderedWidth || Math.min(400, element.clientWidth)
    element.style.setProperty(
      '--google-sdk-scale-x',
      String(element.clientWidth / width),
    )
    if (renderedWidth) return
    renderedWidth = width
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
