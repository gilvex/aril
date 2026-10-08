import { controlBounds } from '../utils/controlBounds.ts'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { ControlPresenceProps } from '../types/controlPresenceProps.ts'
import { createControlPresenceStore } from './createControlPresenceStore.ts'
import { findControl } from '../utils/findControl.ts'
import { controlSelectionRects } from '../utils/controlSelectionRects.ts'
export function useControlMarkers({
  root,
  peers,
  active,
  route,
}: ControlPresenceProps) {
  const store = useMemo(createControlPresenceStore, [])
  const markers = useSyncExternalStore(store.subscribe, store.getState)
  useEffect(() => {
    const container = root.current
    if (!active || !container) {
      store.render([])
      return
    }
    let frame = 0
    const draw = () => {
      frame = 0
      store.render(
        peers
          .filter(
            (peer) =>
              peer.controls?.route === route &&
              Date.now() - peer.seenAt < 15000,
          )
          .map((peer) => {
            const pointer = peer.controls!.pointer,
              focus = peer.controls!.focus
            const pointerElement =
              pointer && findControl(container, pointer.scope, pointer.target)
            const pointerBounds = pointerElement?.getBoundingClientRect()
            const focused =
              focus && findControl(container, focus.scope, focus.target)
            const rect = focused ? controlBounds(focused) : null
            return {
              peer,
              pointer:
                pointerBounds && pointer
                  ? {
                      x: pointerBounds.left + pointer.x * pointerBounds.width,
                      y: pointerBounds.top + pointer.y * pointerBounds.height,
                    }
                  : null,
              focus: rect
                ? {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                  }
                : null,
              selection:
                focused && focus
                  ? controlSelectionRects(focused, focus.selection)
                  : [],
            }
          }),
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(container)
    document.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    // Also follows floating panels while dragged and expires stale focus without input.
    const timer = setInterval(schedule, 150)
    draw()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      clearInterval(timer)
      document.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
    }
  }, [root, peers, active, route, store])
  return markers
}
