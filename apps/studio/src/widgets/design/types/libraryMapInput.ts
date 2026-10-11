import type { Edge } from '@xyflow/react'
import type { LibraryMapAsset } from './libraryMapAsset.ts'
export type LibraryMapInput = {
  assets: LibraryMapAsset[]
  edges: Edge[]
  path: string[]
  query: string
  kind: string
  usage: 'all' | 'used' | 'unused'
  selected: string | null
  focus: boolean
  depth: number
  direction: 'both' | 'uses' | 'usedBy'
  offset: number
  individual?: boolean
  expanded?: Record<string, number>
  positions?: Record<string, { x: number; y: number }>
}
