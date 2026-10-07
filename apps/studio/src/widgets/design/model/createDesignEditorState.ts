import type { DesignEditorState } from '../types/designEditorState.ts'
export function createDesignEditorState(): DesignEditorState {
  return {
    pageId: 'design-main',
    selection: [],
    drafts: {},
    tool: 'select',
    layers: true,
    inspector: false,
    styles: false,
    editingId: null,
    collapsed: [],
  }
}
