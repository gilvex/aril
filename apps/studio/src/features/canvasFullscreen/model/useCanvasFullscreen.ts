import { useCanvasFullscreenModel } from '@/features/canvasFullscreen/model/useCanvasFullscreenModel.ts'
import { useEffect, useRef } from 'react'

export function useCanvasFullscreen(active = true) {
  const element = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const { fullscreen, setFullscreen } = useCanvasFullscreenModel(() => {
    const fullscreen: boolean = false
    return { fullscreen }
  })
  useEffect(() => {
    if (active) return
    if (document.fullscreenElement === element.current)
      void document.exitFullscreen().catch(() => {})
    setFullscreen(false)
  }, [active, setFullscreen])
  useEffect(() => {
    if (!active) return
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
  }, [active, fullscreen, setFullscreen])
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
