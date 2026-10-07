import type { CameraPresence } from './cameraPresence.ts'
import type { DragPosition } from './dragPosition.ts'
import type { Profile } from './profile.ts'
import type { RequirementPresence } from './requirementPresence.ts'
export type Presence = {
  chat?: { text: string; expiresAt: number } | null
  clientId: string
  profile: Profile
  boardId: string | null
  designPageId?: string | null
  view: string
  cursor: { x: number; y: number } | null
  selected: string[]
  selectedEdges?: string[]
  seenAt: number
  sequence?: number
  dragging?: DragPosition[]
  camera?: CameraPresence | null
  following?: string | null
  requirement?: RequirementPresence | null
}
