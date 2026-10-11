import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryTabs({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch, openLibrary } = model
  const layers = useCallback(() => patch({ leftTab: 'layers' }), [patch])
  const library = useCallback(() => openLibrary(), [openLibrary])
  return (
    <div className="design-library-tabs">
      <button aria-pressed onClick={layers}>
        {t('Layers')}
      </button>
      <button onClick={library}>{t('Library')}</button>
    </div>
  )
}
