import { lazy } from 'react'
export const DesignBoard = lazy(() =>
  import('@/widgets/design/index.ts').then((module) => ({
    default: module.DesignBoard,
  })),
)
