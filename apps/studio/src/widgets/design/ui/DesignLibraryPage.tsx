import { ReactFlowProvider } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useDesignDocument } from '../model/useDesignDocument.ts'
import type { DesignBoardProps } from '../types/designBoardProps.ts'
import { DesignLibraryFilters } from './DesignLibraryFilters.tsx'
import { DesignLibraryGraph } from './DesignLibraryGraph.tsx'
import { DesignUsageDetails } from './DesignUsageDetails.tsx'
import { DesignVariablesWorkspace } from './DesignVariablesWorkspace.tsx'
import { DesignLibraryPageActions } from './DesignLibraryPageActions.tsx'
import '../designLibrary.css'
import './designUsage.css'
import './designLibraryPage.css'
import '@xyflow/react/dist/style.css'
export function DesignLibraryPage(props: DesignBoardProps) {
  const model = useDesignDocument(props)
  const { t } = useTranslation()
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
        <div className="library-page-explorer">
          <ReactFlowProvider>
            <DesignLibraryGraph model={model} />
          </ReactFlowProvider>
          <aside
            className="library-page-details"
            aria-label={t('Asset details')}
          >
            <DesignUsageDetails model={model} />
            <DesignLibraryPageActions model={model} />
          </aside>
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
