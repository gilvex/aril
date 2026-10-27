import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useDesignDocument } from '../model/useDesignDocument.ts'
import { useLibraryExplorer } from '../model/useLibraryExplorer.ts'
import type { DesignBoardProps } from '../types/designBoardProps.ts'
import { DesignLibraryFilters } from './DesignLibraryFilters.tsx'
import { DesignVariablesWorkspace } from './DesignVariablesWorkspace.tsx'
import { LibraryExplorer } from './LibraryExplorer.tsx'
import '../designLibrary.css'
import './designUsage.css'
import './designLibraryPage.css'
import './libraryMap.css'
import '@xyflow/react/dist/style.css'
export function DesignLibraryPage(props: DesignBoardProps) {
  const model = useDesignDocument({
    ...props,
    panelLayoutKey: 'aril:libraryPanelLayout:v1',
  })
  const explorer = useLibraryExplorer(model)
  const { t } = useTranslation()
  return (
    <section className="library-page" aria-label={t('Library')}>
      <header className="library-page-heading">
        <div>
          <Text as="h1">{t('Library')}</Text>
          <Text as="p">
            {t('Explore assets, their connections, and where they are used.')}
          </Text>
        </div>
        {props.navigation}
      </header>
      <DesignLibraryFilters model={model} />
      {model.libraryTab === 'variables' ? (
        <div className="library-page-variables">
          <DesignVariablesWorkspace model={model} />
        </div>
      ) : (
        <LibraryExplorer model={model} explorer={explorer} />
      )}
      {model.libraryError && (
        <Text as="p" role="alert" className="design-library-error">
          {model.libraryError}
        </Text>
      )}
    </section>
  )
}
