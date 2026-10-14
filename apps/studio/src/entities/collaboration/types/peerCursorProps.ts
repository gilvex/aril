import type { Presence } from '@aril/domain/collaboration'
export type PeerCursorProps = Pick<Presence, 'profile' | 'chat'> & {
  x: number
  y: number
  scale?: number
}
