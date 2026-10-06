import type { Profile } from '@pomegranate/domain/collaboration'
import { type Edge } from '@xyflow/react'
import type { WireRoute } from './wireRoute.ts'

export type RoutedEdge = Edge<
  {
    selectors: Profile[]
    currentUserId: string
    route?: WireRoute
    number: number
    muted: boolean
    select: () => void
  },
  'smoothstep'
>
