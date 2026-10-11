import { ReactFlowProvider } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useDesignDocument } from '../model/useDesignDocument.ts'
import { useLibraryExplorer } from '../model/useLibraryExplorer.ts'
import type { DesignBoardProps } from '../types/designBoardProps.ts'
import { DesignLibraryFilters } from './DesignLibraryFilters.tsx'
import { DesignVariablesWorkspace } from './DesignVariablesWorkspace.tsx'
import { DesignLibraryPageActions } from './DesignLibraryPageActions.tsx'
import { LibraryCatalog } from './LibraryCatalog.tsx'
import { LibraryMapToolbar } from './LibraryMapToolbar.tsx'
import { LibraryMapPagination } from './LibraryMapPagination.tsx'
import { LibraryMap } from './LibraryMap.tsx'
import { LibraryBrowse } from './LibraryBrowse.tsx'
import { LibraryDetailsPanel } from './LibraryDetailsPanel.tsx'
import '../designLibrary.css'
import './designUsage.css'
import './designLibraryPage.css'
import './libraryMap.css'
import '@xyflow/react/dist/style.css'
export function DesignLibraryPage(props: DesignBoardProps) {
  const model = useDesignDocument(props)
  const explorer = useLibraryExplorer(model)
  const { t } = useTranslation()
  const details = Boolean(
    model.libraryDetailsOpen &&
    (model.libraryAsset || model.librarySelection.length),
  )
  return (
    <section className="library-page" aria-label={t('Library')}>
      <header className="library-page-heading">
        <div>
          <h1>{t('Library')}</h1>
          <p>
            {t('Explore assets, their connections, and where they are used.')}
          </p>
        </div>
        {props.navigation}
      </header>
      <DesignLibraryFilters model={model} />
      {model.libraryTab === 'variables' ? (
        <div className="library-page-variables">
          <DesignVariablesWorkspace model={model} />
        </div>
      ) : (
        <div
          className="library-page-explorer"
          data-details={(details && !model.compact) || undefined}
        >
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
          {details && <LibraryDetailsPanel model={model} explorer={explorer} />}
        </div>
      )}
      {model.libraryError && (
        <p role="alert" className="design-library-error">
          {model.libraryError}
        </p>
      )}
    </section>
  )
}
