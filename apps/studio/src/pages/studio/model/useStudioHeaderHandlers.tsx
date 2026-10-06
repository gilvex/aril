import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'

import type { StudioHeaderHandlersProps } from '../types/useStudioHeaderHandlersProps.ts'
export function useStudioHeaderHandlers({
  state,
  onWorkspaces,
  multiplayer,
  setNotice,
}: StudioHeaderHandlersProps) {
  const { t } = useTranslation()

  const handleSwitchWorkspaceClick = useCallback<
    () => Promise<void>
  >(async () => {
    if (await state.flush()) onWorkspaces(multiplayer.profile)
    else
      setNotice(
        t(
          'Finish saving or resolve your unsaved edits before switching workspaces.',
        ),
      )
  }, [state, onWorkspaces, multiplayer.profile, setNotice, t])
  return { handleSwitchWorkspaceClick }
}
