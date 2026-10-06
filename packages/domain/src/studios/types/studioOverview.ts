import type { StudioSummary } from './studioSummary.ts'
import type { StudioPreviewNode } from './studioPreviewNode.ts'

export type StudioOverview = StudioSummary & {
  nodes: StudioPreviewNode[]
  edges: { source: string; target: string }[]
  members: { id: string; name: string; color: string; avatar: string }[]
  memberCount: number
  boardCount: number
}
