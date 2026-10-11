import { ReactFlowProvider } from '@xyflow/react'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import { useLibraryPanelBounds } from '../model/useLibraryPanelBounds.ts'
import { DesignLibraryPageActions } from './DesignLibraryPageActions.tsx'
import { LibraryCatalog } from './LibraryCatalog.tsx'
import { LibraryMapToolbar } from './LibraryMapToolbar.tsx'
import { LibraryMapPagination } from './LibraryMapPagination.tsx'
import { LibraryMap } from './LibraryMap.tsx'
import { LibraryBrowse } from './LibraryBrowse.tsx'
import { LibraryPanelSurface } from './LibraryPanelSurface.tsx'
import '../designPanels.css'
import './libraryDetailsPanel.css'

export function LibraryExplorer({ model, explorer }: LibraryExplorerProps) {
  const ref = useLibraryPanelBounds(model.patch)
  const details = Boolean(
    model.libraryDetailsOpen &&
    (model.libraryAsset || model.librarySelection.length),
  )
  return (
    <section className="library-page-explorer" ref={ref}>
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
      {details && <LibraryPanelSurface model={model} explorer={explorer} />}
    </section>
  )
}
