import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'

import type { StudioMobileMenuHandlersProps } from '../types/useStudioMobileMenuHandlersProps.ts'
export function useStudioMobileMenuHandlers({
  state,
  onWorkspaces,
  multiplayer,
  setNotice,
  setSidebarOpen,
  setCollaborationPanel,
  setModal,
  loadHistory,
  importRef,
  exportWorkspace,
}: StudioMobileMenuHandlersProps) {
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
  const handleClick = useCallback<() => void>(() => {
    setSidebarOpen(false)
    setCollaborationPanel('activity')
  }, [setSidebarOpen, setCollaborationPanel])
  const handleClick2 = useCallback<() => void>(() => {
    setSidebarOpen(false)
    setModal('agents')
  }, [setSidebarOpen, setModal])
  const handleClick3 = useCallback<() => void>(() => {
    setSidebarOpen(false)
    void loadHistory()
  }, [setSidebarOpen, loadHistory])
  const handleClick4 = useCallback<() => void>(() => {
    setSidebarOpen(false)
    importRef.current?.click()
  }, [setSidebarOpen, importRef])
  const handleClick5 = useCallback<() => void>(() => {
    setSidebarOpen(false)
    exportWorkspace()
  }, [setSidebarOpen, exportWorkspace])
  return {
    handleSwitchWorkspaceClick,
    handleClick,
    handleClick2,
    handleClick3,
    handleClick4,
    handleClick5,
  }
}
