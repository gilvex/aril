import type { DesignEditorState } from '../types/designEditorState.ts'

export function designMobileToolPatch(
  tab: DesignEditorState['mobileToolsTab'],
): Partial<DesignEditorState> {
  return {
    mobileToolsTab: tab,
    layers: tab === 'layers' || tab === 'library',
    inspector: tab === 'properties',
    ...(tab === 'layers' || tab === 'library' ? { leftTab: tab } : {}),
    styles: false,
    pagesOpen: tab === 'pages',
    pageQuery: '',
    renamingPageId: null,
    layerActionsId: null,
  }
}
