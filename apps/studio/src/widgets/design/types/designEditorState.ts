import type { DesignElement } from '@pomegranate/domain/design'
export type DesignEditorState = {
  pageId: string
  selection: string[]
  drafts: Record<string, Partial<DesignElement>>
  tool: 'select' | 'pan'
  pagesOpen: boolean
  pageQuery: string
  layers: boolean
  inspector: boolean
  styles: boolean
  editingId: string | null
  collapsed: string[]
  renamingPageId: string | null
  renameDraft: string
  contextPoint: { x: number; y: number } | null
}
