import { lazy } from 'react'
export const CanvasBoard = lazy(() =>
  import('@/widgets/board/index.ts').then((module) => ({
    default: module.CanvasBoard,
  })),
)
