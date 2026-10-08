import type { Presence } from '@pomegranate/domain/collaboration'
export type ControlMarker = {
  peer: Presence
  pointer: { x: number; y: number } | null
  focus: { x: number; y: number; width: number; height: number } | null
  selection: { x: number; y: number; width: number; height: number }[]
}
