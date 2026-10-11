import type { Node } from '@xyflow/react'
export type DesignLibraryGraphNode = Node<
  {
    label: string
    kind: 'component' | 'variable' | 'machine' | 'page'
    assetId: string
    icon?: string
    count: number
  },
  'asset'
>
