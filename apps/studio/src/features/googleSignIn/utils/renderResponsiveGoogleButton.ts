import type { GoogleApi } from '../types/googleApi.ts'

export function renderResponsiveGoogleButton(
  element: HTMLElement,
  api: GoogleApi,
  locale: string,
) {
  let previousWidth = 0
  let previousTheme = ''
  let frame = 0
  const render = () => {
    // Measure before scaling so repeated resizes cannot shrink the button.
    const width = Math.min(400, element.clientWidth)
    const theme =
      document.documentElement.dataset.theme === 'dark'
        ? 'filled_black'
        : 'outline'
    if (width < 1 || (width === previousWidth && theme === previousTheme))
      return
    previousWidth = width
    previousTheme = theme
    element.replaceChildren()
    api.accounts.id.renderButton(element, {
      type: 'standard',
      theme,
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
  const themeObserver = new MutationObserver(render)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  observer.observe(element)
  render()
  return () => {
    observer.disconnect()
    themeObserver.disconnect()
    cancelAnimationFrame(frame)
  }
}
