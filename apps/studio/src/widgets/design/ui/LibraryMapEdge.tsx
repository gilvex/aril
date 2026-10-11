import { BaseEdge, useInternalNode, type EdgeProps } from '@xyflow/react'
import { libraryEdgePath } from '../utils/libraryEdgePath.ts'
export function LibraryMapEdge({
  id,
  source,
  target,
  markerEnd,
  style,
}: EdgeProps) {
  const a = useInternalNode(source),
    b = useInternalNode(target)
  if (!a || !b) return null
  const path = libraryEdgePath(
    {
      x: a.internals.positionAbsolute.x + (a.measured.width || 180) / 2 - 24,
      y: a.internals.positionAbsolute.y + 8,
      width: 48,
      height: 48,
    },
    {
      x: b.internals.positionAbsolute.x + (b.measured.width || 180) / 2 - 24,
      y: b.internals.positionAbsolute.y + 8,
      width: 48,
      height: 48,
    },
  )
  return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
}
