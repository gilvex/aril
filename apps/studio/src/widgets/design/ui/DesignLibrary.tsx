import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { X } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { SurfaceGrip } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignLibraryTabs } from './DesignLibraryTabs.tsx'
import { DesignComponentDetails } from './DesignComponentDetails.tsx'
import { DesignLibraryFilters } from './DesignLibraryFilters.tsx'
import { DesignLibraryGraph } from './DesignLibraryGraph.tsx'
import { DesignUsageDetails } from './DesignUsageDetails.tsx'
import { DesignVariablesWorkspace } from './DesignVariablesWorkspace.tsx'
import './designUsage.css'
export function DesignLibrary({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { patch } = model
  const close = useCallback(
    () => patch({ layers: false, panelMaximized: null }),
    [patch],
  )
  return (
    <aside className="design-layers design-library" aria-label={t('Library')}>
      <header>
        <SurfaceGrip />
        <DesignLibraryTabs model={model} />
        <button
          className="icon-button"
          onClick={close}
          aria-label={t('Close library')}
        >
          <X size={16} />
        </button>
      </header>
      <div className="design-library-body">
        <DesignLibraryFilters model={model} />
        {model.libraryTab === 'variables' ? (
          <DesignVariablesWorkspace model={model} />
        ) : (
          <>
            <ReactFlowProvider>
              <DesignLibraryGraph model={model} />
            </ReactFlowProvider>
            <DesignUsageDetails model={model} />
            {model.component &&
              model.libraryAsset === `component:${model.component.id}` && (
                <DesignComponentDetails model={model} />
              )}
            <div className="design-library-buttons">
              <Button
                className="button"
                size="sm"
                variant="outline"
                disabled={
                  readOnly ||
                  !model.selected.length ||
                  Object.keys(model.library.components).length >= 2000
                }
                onClick={model.createComponent}
              >
                <Text>{t('Create component from selection')}</Text>
              </Button>
              <Button
                className="button"
                size="sm"
                variant="ghost"
                disabled={
                  readOnly ||
                  Object.keys(model.library.components).length >= 2000
                }
                onClick={model.example}
              >
                <Text>{t('Add example kit')}</Text>
              </Button>
            </div>
          </>
        )}
        {model.libraryError && (
          <Text as="p" role="alert" className="design-library-error">
            {model.libraryError}
          </Text>
        )}
      </div>
    </aside>
  )
}
