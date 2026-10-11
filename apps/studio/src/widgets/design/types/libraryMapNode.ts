import type { Node } from '@xyflow/react'
export type LibraryMapNode = Node<{
  label: string
  kind: 'component' | 'variable' | 'machine' | 'page' | 'cluster'
  count: number
  color: string
  icon?: string
  path?: string[]
  external?: boolean
}, 'map'>
