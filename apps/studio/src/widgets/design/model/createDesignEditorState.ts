import type { DesignEditorState } from '../types/designEditorState.ts'
export function createDesignEditorState(): DesignEditorState {
  return {
    pageId: 'design-main',
    selection: [],
    drafts: {},
    tool: 'select',
    pagesOpen: false,
    pageQuery: '',
    layers: false,
    inspector: false,
    styles: false,
    editingId: null,
    collapsed: [],
    renamingPageId: null,
    renameDraft: '',
    contextPoint: null,
  }
}
