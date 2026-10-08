import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryTabs({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch } = model
  const layers = useCallback(() => patch({ leftTab: 'layers' }), [patch])
  const library = useCallback(() => patch({ leftTab: 'library' }), [patch])
  return (
    <div className="design-library-tabs">
      <button aria-pressed={model.leftTab === 'layers'} onClick={layers}>
        {t('Layers')}
      </button>
      <button aria-pressed={model.leftTab === 'library'} onClick={library}>
        {t('Library')}
      </button>
    </div>
  )
}
