import type { DesignEditorState } from '../types/designEditorState.ts'
export function createDesignEditorState(): DesignEditorState {
  return {
    compact: false,
    panelSpace: 1000,
    layersWidth: 280,
    inspectorWidth: 300,
    layersDocked: false,
    inspectorDocked: false,
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
