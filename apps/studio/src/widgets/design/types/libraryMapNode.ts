import type { Node } from '@xyflow/react'
import type { ComponentGlyph } from './componentGlyph.ts'
export type LibraryMapNode = Node<
  {
    label: string
    kind: 'component' | 'variable' | 'machine' | 'page' | 'cluster'
    count: number
    color: string
    icon?: string
    glyph?: ComponentGlyph
    path?: string[]
    external?: boolean
  },
  'map'
>
