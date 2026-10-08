import type { RefObject } from 'react'
import type { Presence } from '@pomegranate/domain/collaboration'
import type { LiveState } from '@pomegranate/domain/liveSession'
export type ControlPresenceProps = {
  root: RefObject<HTMLDivElement | null>
  workspaceId: string
  route: string
  active: boolean
  peers: Presence[]
  sendPresence: (value: Partial<LiveState>, force?: boolean) => void
}
