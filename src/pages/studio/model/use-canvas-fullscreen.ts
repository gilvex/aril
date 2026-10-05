import { useEffect, useRef, useState } from 'react'

export function useCanvasFullscreen() {
  const element = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  useEffect(() => {
    const sync = () => {
      setFullscreen(document.fullscreenElement === element.current)
      if (!document.fullscreenElement) button.current?.focus()
    }
    const escape = (event: KeyboardEvent) => {
      if (fullscreen && event.key === 'Escape' && !document.fullscreenElement) {
        setFullscreen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('keydown', escape)
    }
  }, [fullscreen])
  async function toggle() {
    if (fullscreen) {
      if (document.fullscreenElement === element.current)
        await document.exitFullscreen()
      setFullscreen(false)
      button.current?.focus()
    } else {
      setFullscreen(true)
      try {
        await element.current?.requestFullscreen?.()
      } catch {
        /* Embedded browser: use the expanded viewport. */
      }
    }
  }
  return { element, button, fullscreen, toggle }
}
