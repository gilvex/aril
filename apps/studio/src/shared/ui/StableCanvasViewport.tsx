import { useLayoutEffect, useRef } from 'react'
import { useReactFlow, useStore } from '@xyflow/react'
import { observeCanvasViewport } from '../utils/observeCanvasViewport.ts'

export function StableCanvasViewport({
  following = false,
}: {
  following?: boolean
}) {
  const flow = useReactFlow()
  const element = useStore((state) => state.domNode)
  const observer = useRef<ReturnType<typeof observeCanvasViewport> | null>(null)
  useLayoutEffect(() => {
    // Following another person deliberately controls the camera instead.
    if (!element || !flow.viewportInitialized || following) return
    const current = observeCanvasViewport(element, flow)
    observer.current = current
    return () => {
      current.disconnect()
      observer.current = null
    }
  }, [element, flow, following])
  // Docking from one edge to another can move the origin without resizing.
  useLayoutEffect(() => observer.current?.update())
  return null
}
