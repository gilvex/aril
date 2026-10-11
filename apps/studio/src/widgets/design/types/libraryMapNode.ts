import type { Node } from '@xyflow/react'
import type { ComponentGlyph } from './componentGlyph.ts'
export type LibraryMapNode = Node<
  {
    label: string
    kind: 'component' | 'variable' | 'machine' | 'page' | 'cluster' | 'more'
    count: number
    color: string
    icon?: string
    glyph?: ComponentGlyph
    path?: string[]
    external?: boolean
    members?: string[]
    expanded?: boolean
    moreFor?: string
    toggle?: () => void
  },
  'map'
>
