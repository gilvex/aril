import type { DesignEditorState } from '../types/designEditorState.ts'

export function designMobileToolPatch(
  tab: DesignEditorState['mobileToolsTab'],
): Partial<DesignEditorState> {
  return {
    mobileToolsTab: tab,
    layers: tab !== 'properties',
    inspector: tab === 'properties',
    ...(tab !== 'properties' ? { leftTab: tab } : {}),
    styles: false,
    pagesOpen: false,
    layerActionsId: null,
  }
}
