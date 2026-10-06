import { useTranslation } from '@/shared/i18n/index.ts'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import { useCallback } from 'react'

import type { StudioContentHandlersProps } from '../types/useStudioContentHandlersProps.ts'
export function useStudioContentHandlers({
  setNotice,
  setPendingImport,
  setModal,
}: StudioContentHandlersProps) {
  const { t } = useTranslation()

  const handleImportWorkspaceFileChange = useCallback<
    (
      e: import('react').ChangeEvent<HTMLInputElement, HTMLInputElement>,
    ) => Promise<void>
  >(
    async (e) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      if (file.size > 5 * 1024 * 1024) {
        setNotice(t('That file is too large. Use a workspace under 5 MB.'))
        return
      }
      try {
        const parsed = workspaceSchema.parse(JSON.parse(await file.text()))
        setPendingImport(parsed)
        setModal('import')
      } catch {
        setNotice(
          t(
            'That file is not a valid Aril workspace. Your existing work is unchanged.',
          ),
        )
      }
    },
    [setNotice, t, setPendingImport, setModal],
  )
  return { handleImportWorkspaceFileChange }
}
