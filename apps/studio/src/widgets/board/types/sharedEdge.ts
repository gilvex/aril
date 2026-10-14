import type { Profile } from '@aril/domain/collaboration'
import { type Edge } from '@xyflow/react'

export type SharedEdge = Edge<
  { selectors: Profile[]; currentUserId: string },
  'smoothstep'
>
