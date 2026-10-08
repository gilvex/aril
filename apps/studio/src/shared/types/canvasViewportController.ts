import type { ReactFlowInstance } from '@xyflow/react'

export type CanvasViewportController = Pick<
  ReactFlowInstance,
  'getViewport' | 'setViewport'
>
