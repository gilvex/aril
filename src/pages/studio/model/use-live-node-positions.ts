import { useEffect, useRef, useState } from 'react'
import type { Idea } from '../../../shared/api/workspace'
import type { Presence } from '../../../../domain/collaboration'

type Position = Idea['position']

// Preview positions never enter the saved document or local undo history.
// Feeding interpolated positions to React Flow keeps edges and the minimap aligned.
export function useLiveNodePositions<
  T extends { id: string; position: Position },
>(nodes: T[], peers: Presence[], localDragging: Set<string>) {
  const [positions, setPositions] = useState<Record<string, Position>>({})
  const displayed = useRef<Record<string, Position>>({})
  useEffect(() => {
    const targets = new Map<string, Position>()
    const currentNodes = new Map(nodes.map((node) => [node.id, node]))
    for (const peer of [...peers].sort((a, b) => a.seenAt - b.seenAt))
      for (const node of peer.dragging || [])
        if (currentNodes.has(node.id) && !localDragging.has(node.id))
          targets.set(node.id, node.position)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame: number
    let previous = performance.now()
    const step = (time: number) => {
      const factor = motion.matches
        ? 1
        : 1 - Math.exp(-Math.min(time - previous, 64) / 32)
      previous = time
      const next: Record<string, Position> = {}
      let moving = false
      for (const id of new Set([
        ...targets.keys(),
        ...Object.keys(displayed.current),
      ])) {
        const node = currentNodes.get(id)
        if (!node || localDragging.has(id)) continue
        const target = targets.get(id) || node.position
        const from = displayed.current[id] || node.position
        const distance = Math.hypot(target.x - from.x, target.y - from.y)
        const settled = motion.matches || distance < 0.1
        if (!settled) {
          moving = true
          next[id] = {
            x: from.x + (target.x - from.x) * factor,
            y: from.y + (target.y - from.y) * factor,
          }
        } else if (targets.has(id)) next[id] = target
      }
      displayed.current = next
      setPositions(next)
      if (moving) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [nodes, peers, localDragging])
  return nodes.map((node) =>
    positions[node.id] && !localDragging.has(node.id)
      ? { ...node, position: positions[node.id] }
      : node,
  )
}
