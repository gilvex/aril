import { useCallback } from 'react'
import { Library } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryButton({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { openLibrary } = model
  const open = useCallback(() => openLibrary(), [openLibrary])
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
