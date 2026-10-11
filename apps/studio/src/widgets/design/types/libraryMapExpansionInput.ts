import type { Edge } from '@xyflow/react'
import type { LibraryMapNode } from './libraryMapNode.ts'
import type { LibraryMapInput } from './libraryMapInput.ts'
export type LibraryMapExpansionInput = {
  nodes: LibraryMapNode[]
  edges: Edge[]
  input: LibraryMapInput
  highlighted: Set<string>
}
