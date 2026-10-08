import { DesignLibraryAssets } from './DesignLibraryAssets.tsx'
import { useCallback, type ChangeEvent } from 'react'
import { X } from 'lucide-react'
import { SurfaceGrip } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignLibraryTabs } from './DesignLibraryTabs.tsx'
import { DesignComponentDetails } from './DesignComponentDetails.tsx'
export function DesignLibrary({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { patch } = model
  const close = useCallback(() => patch({ layers: false }), [patch])
  const search = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      patch({ libraryQuery: e.target.value }),
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
        <input
          aria-label={t('Search assets')}
          placeholder={t('Search assets')}
          value={model.libraryQuery}
          onChange={search}
        />
        <DesignLibraryAssets model={model} />
        {model.component && <DesignComponentDetails model={model} />}
        <button
          className="button"
          disabled={
            readOnly || Object.keys(model.library.components).length >= 100
          }
          onClick={model.example}
        >
          {t('Add example kit')}
        </button>
        {model.libraryError && (
          <p role="alert" className="design-library-error">
            {model.libraryError}
          </p>
        )}
        <p>{t('Assets are saved with this design.')}</p>
      </div>
    </aside>
  )
}
