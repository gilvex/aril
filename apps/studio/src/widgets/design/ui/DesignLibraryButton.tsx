import { useCallback } from 'react'
import { Library } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryButton({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch } = model
  const open = useCallback(
    () =>
      patch({
        layers: true,
        leftTab: 'library',
        dockActive: 'left',
        pagesOpen: false,
      }),
    [patch],
  )
  return (
    <button
      className="button design-library-button"
      aria-label={t('Open Library')}
      title={t('Open Library')}
      onClick={open}
    >
      <Library size={17} />
      <span>{t('Library')}</span>
    </button>
  )
}
