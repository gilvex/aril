import { useCallback } from 'react'

import type { StudioDesktopNavigationHandlersProps } from '../types/useStudioDesktopNavigationHandlersProps.ts'
export function useStudioDesktopNavigationHandlers({
  actionsMenu,
  setCollaborationPanel,
}: StudioDesktopNavigationHandlersProps) {
  const dismissActionsMenu = useCallback<
    (e: import('react').MouseEvent<HTMLDivElement, MouseEvent>) => void
  >((e) => {
    // Settings remain open; only workspace actions dismiss the menu.
    if (!(e.target as Element).closest('button')) return
    const menu = e.currentTarget.closest('details')
    menu?.removeAttribute('open')
    menu?.querySelector('summary')?.focus()
  }, [])
  const openTeamActivity = useCallback<() => void>(() => {
    actionsMenu.current?.querySelector('summary')?.focus()
    setCollaborationPanel('activity')
  }, [actionsMenu, setCollaborationPanel])
  return { dismissActionsMenu, openTeamActivity }
}
