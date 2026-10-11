import { lazy } from 'react'
export const DesignLibraryPage = lazy(() =>
  import('@/widgets/design/index.ts').then((module) => ({
    default: module.DesignLibraryPage,
  })),
)
