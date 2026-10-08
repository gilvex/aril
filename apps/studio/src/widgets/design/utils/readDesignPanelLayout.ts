import { createDesignEditorState } from '../model/createDesignEditorState.ts'
import { designPanelPreference } from './designPanelPreference.ts'
export function readDesignPanelLayout(raw: string | null) {
  const result = designPanelPreference(createDesignEditorState())
  try {
    const value = JSON.parse(raw || '{}')
    if (!value || typeof value !== 'object') return result
    for (const key of ['layersDocked', 'inspectorDocked'] as const)
      if (
        value[key] === null ||
        ['left', 'right', 'top', 'bottom'].includes(value[key])
      )
        result[key] = value[key]
    for (const key of [
      'layersWidth',
      'inspectorWidth',
      'layersHeight',
      'inspectorHeight',
      'layersDockHeight',
      'inspectorDockHeight',
    ] as const)
      if (typeof value[key] === 'number' && Number.isFinite(value[key]))
        result[key] = Math.max(
          key.endsWith('Width') ? 220 : 180,
          Math.min(1600, value[key]),
        )
    if (['split', 'tabs'].includes(value.dockMode))
      result.dockMode = value.dockMode
    if (['left', 'right'].includes(value.dockActive))
      result.dockActive = value.dockActive
    for (const side of ['left', 'right'] as const) {
      const position = value.panelPositions?.[side]
      if (
        position &&
        Number.isFinite(position.x) &&
        Number.isFinite(position.y)
      )
        result.panelPositions[side] = {
          x: Math.max(0, Math.min(20000, position.x)),
          y: Math.max(0, Math.min(20000, position.y)),
        }
    }
  } catch {
    /* Invalid or unavailable preferences use the standard layout. */
  }
  return result
}
