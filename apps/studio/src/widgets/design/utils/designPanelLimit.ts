import type { DesignEditorState } from '../types/designEditorState.ts'
export function designPanelLimit(state: DesignEditorState, docked: boolean) {
  const both =
    state.layers &&
    state.layersDocked &&
    state.inspector &&
    state.inspectorDocked
  return Math.max(
    220,
    Math.min(
      480,
      docked && both ? (state.panelSpace - 280) / 2 : state.panelSpace - 320,
    ),
  )
}
