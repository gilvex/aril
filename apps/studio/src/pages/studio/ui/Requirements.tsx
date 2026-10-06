import { lazy } from 'react'
export const Requirements = lazy(() =>
  import('@/widgets/requirements/index.ts').then((module) => ({
    default: module.Requirements,
  })),
)
