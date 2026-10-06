import type { Presence, Profile } from '@pomegranate/domain/collaboration'
export type LiveCursorsProps = {
  peers: Presence[]
  nodes: { id: string; position: { x: number; y: number } }[]
  profile: Profile
  selectedIds: Set<string>
}
