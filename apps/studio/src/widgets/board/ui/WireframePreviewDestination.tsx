import { ArrowRight } from 'lucide-react'
import { useWireframePreviewDestinationHandlers } from '../model/useWireframePreviewDestinationHandlers.tsx'

import type { WireframePreviewDestinationProps } from '../types/wireframePreviewDestinationProps.ts'
export function WireframePreviewDestination({
  e,
  focus,
  setPreviewMessage,
  graph,
}: WireframePreviewDestinationProps) {
  const { handleClick } = useWireframePreviewDestinationHandlers({
    focus,
    e,
    setPreviewMessage,
    graph,
  })
  return (
    <button className="button wire-flow-link" key={e.id} onClick={handleClick}>
      {e.label}
      <ArrowRight size={14} />
      {graph.nodes.find((n) => n.id === e.target)?.data.title}
    </button>
  )
}
