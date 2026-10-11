import { ReactFlowProvider } from '@xyflow/react'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import { useDesignPanelBounds } from '../model/useDesignPanelBounds.ts'
import { DesignLibraryPageActions } from './DesignLibraryPageActions.tsx'
import { LibraryCatalog } from './LibraryCatalog.tsx'
import { LibraryMapToolbar } from './LibraryMapToolbar.tsx'
import { LibraryMapPagination } from './LibraryMapPagination.tsx'
import { LibraryMap } from './LibraryMap.tsx'
import { LibraryBrowse } from './LibraryBrowse.tsx'
import { LibraryDetailsPanel } from './LibraryDetailsPanel.tsx'
import { DesignDockPreview } from './DesignDockPreview.tsx'
import '../designPanels.css'
import './libraryDetailsPanel.css'

export function LibraryExplorer({ model, explorer }: LibraryExplorerProps) {
  const ref = useDesignPanelBounds(model.patch)
  const details = Boolean(
    model.libraryDetailsOpen &&
    (model.libraryAsset || model.librarySelection.length),
  )
  const panelModel = { ...model, layers: false, inspector: details }
  return (
    <section className="library-page-explorer" ref={ref} data-surface-bounds>
      <div className="library-catalog-column">
        <LibraryCatalog model={model} explorer={explorer} />
        <DesignLibraryPageActions model={model} />
      </div>
      <div className="library-map-column">
        <LibraryMapToolbar model={model} explorer={explorer} />
        {model.libraryTab === 'browse' ? (
          <LibraryBrowse model={model} explorer={explorer} />
        ) : (
          <ReactFlowProvider>
            <LibraryMap model={model} explorer={explorer} />
          </ReactFlowProvider>
        )}
        <LibraryMapPagination model={model} explorer={explorer} />
      </div>
      {details && (
        <LibraryDetailsPanel model={panelModel} explorer={explorer} />
      )}
      {!model.compact && details && <DesignDockPreview model={panelModel} />}
    </section>
  )
}
