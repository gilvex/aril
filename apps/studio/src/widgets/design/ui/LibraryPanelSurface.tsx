import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import { LibraryDetailsPanel } from './LibraryDetailsPanel.tsx'
import { DesignDockPreview } from './DesignDockPreview.tsx'

export function LibraryPanelSurface({ model, explorer }: LibraryExplorerProps) {
  const bounds = model.libraryPanelBounds
  const panelModel = {
    ...model,
    layers: false,
    inspector: true,
    panelWorkspaceDock: true,
    panelDockBounds:
      model.libraryDockScope === 'graph' ? bounds?.graph : undefined,
  }
  if (model.compact)
    return <LibraryDetailsPanel model={panelModel} explorer={explorer} />
  if (!bounds) return null
  return (
    <div
      className="library-panel-surface"
      style={bounds.workspace}
      data-surface-bounds
    >
      <LibraryDetailsPanel model={panelModel} explorer={explorer} />
      <DesignDockPreview model={panelModel} />
    </div>
  )
}
