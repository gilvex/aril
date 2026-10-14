import type { RefObject } from 'react'
import type { Presence } from '@aril/domain/collaboration'
import type { LiveState } from '@aril/domain/liveSession'
export type ControlPresenceProps = {
  root: RefObject<HTMLDivElement | null>
  workspaceId: string
  route: string
  active: boolean
  peers: Presence[]
  sendPresence: (value: Partial<LiveState>, force?: boolean) => void
}
