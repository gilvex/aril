import type { WireRoute } from '@/widgets/board/types/wireRoute.ts'
import type { Profile } from '@pomegranate/domain/collaboration'
import { type Edge } from '@xyflow/react'

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
