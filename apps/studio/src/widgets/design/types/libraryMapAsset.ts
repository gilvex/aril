import type { ComponentGlyph } from './componentGlyph.ts'
export type LibraryMapAsset = {
  id: string
  assetId: string
  kind: 'component' | 'variable' | 'machine' | 'page'
  name: string
  icon?: string
  glyph?: ComponentGlyph
  library: string
  family: string
  count: number
}
