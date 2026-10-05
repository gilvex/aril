import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type { ReactFlowInstance, Viewport } from '@xyflow/react'
import type { CameraPresence, Presence } from '../../../../domain/collaboration'
import {
  cameraFromViewport,
  viewportFromCamera,
} from '../../../../domain/follow'

export function useFollowViewport(
  flow: Pick<ReactFlowInstance, 'getViewport' | 'setViewport'> | null,
  surface: RefObject<HTMLDivElement | null>,
  following: Presence | null,
  send: (changes: { camera?: CameraPresence | null }) => void,
) {
  const target = useRef(following)
  target.current = following
  const publish = useCallback(
    (viewport: Viewport) => {
      const element = surface.current
      if (element && !target.current)
        send({
          camera: cameraFromViewport(viewport, element.getBoundingClientRect()),
        })
    },
    [send, surface],
  )
  useEffect(() => {
    if (!flow || !surface.current) return
    const observer = new ResizeObserver(() => publish(flow.getViewport()))
    observer.observe(surface.current)
    publish(flow.getViewport())
    return () => observer.disconnect()
  }, [flow, publish, surface])
  const followingId = following?.clientId
  useEffect(() => {
    if (flow && !followingId) publish(flow.getViewport())
  }, [flow, followingId, publish])
  useEffect(() => {
    if (!flow || !followingId) return
    let frame = 0
    let last = performance.now()
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const animate = (now: number) => {
      const camera = target.current?.camera
      const element = surface.current
      if (camera && element) {
        const desired = viewportFromCamera(
          camera,
          element.getBoundingClientRect(),
        )
        const current = flow.getViewport()
        const amount = reduced.matches
          ? 1
          : 1 - Math.exp(-Math.min(now - last, 100) / 45)
        if (
          Math.abs(current.x - desired.x) > 0.1 ||
          Math.abs(current.y - desired.y) > 0.1 ||
          Math.abs(current.zoom - desired.zoom) > 0.0001
        ) {
          void flow.setViewport({
            x: current.x + (desired.x - current.x) * amount,
            y: current.y + (desired.y - current.y) * amount,
            zoom: current.zoom + (desired.zoom - current.zoom) * amount,
          })
        }
      }
      last = now
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [flow, followingId, surface])
  return publish
}
