import type { DesignEditorState } from '../types/designEditorState.ts'
export function designPanelPreference(state: DesignEditorState) {
  const {
    layersDocked,
    inspectorDocked,
    layersWidth,
    inspectorWidth,
    layersHeight,
    inspectorHeight,
    layersDockHeight,
    inspectorDockHeight,
    panelPositions,
    dockMode,
    dockActive,
  } = state
  return {
    layersDocked,
    inspectorDocked,
    layersWidth,
    inspectorWidth,
    layersHeight,
    inspectorHeight,
    layersDockHeight,
    inspectorDockHeight,
    panelPositions,
    dockMode,
    dockActive,
  }
}
