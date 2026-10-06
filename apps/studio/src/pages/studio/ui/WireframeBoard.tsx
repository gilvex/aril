import { lazy } from 'react'
export const WireframeBoard = lazy(() =>
  import('@/widgets/board/index.ts').then((module) => ({
    default: module.WireframeBoard,
  })),
)
