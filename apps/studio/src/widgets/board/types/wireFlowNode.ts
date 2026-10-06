import type { WireNode } from '@pomegranate/domain/wireframe'
import { type Node } from '@xyflow/react'

export type WireFlowNode = Node<
  WireNode['data'] & {
    preview: boolean
    checkpoint: () => void
    follow?: () => void
    selectorColor?: string
  },
  'wireframe'
>
