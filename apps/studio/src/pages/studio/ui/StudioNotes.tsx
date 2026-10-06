import { lazy } from 'react'
export const StudioNotes = lazy(() =>
  import('@/widgets/notes').then((module) => ({ default: module.Notes })),
)
