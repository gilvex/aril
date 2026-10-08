import { Button } from 'vagabond-ui/button'
import { StudioDrawer } from '@/shared/ui/index.tsx'
import { useCallback } from 'react'
import { Settings } from 'lucide-react'
import { InstallApp } from '@/features/installApp/index.ts'
import { LanguagePicker } from '@/features/appearance/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useStudioMobileMenuHandlers } from '../model/useStudioMobileMenuHandlers.tsx'

import { ThemePicker } from '@/features/appearance/index.ts'
import { ChevronDown, X } from 'lucide-react'
import { StudioMobileTools } from './StudioMobileTools.tsx'

import type { StudioMobileMenuProps } from '../types/studioMobileMenuProps.ts'
export function StudioMobileMenu({
  setView,
  sidebarRef,
  sidebarOpen,
  setSidebarOpen,
  state,
  onWorkspaces,
  multiplayer,
  setNotice,
  studio,
  setCollaborationPanel,
  setModal,
  loadHistory,
  importRef,
  exportWorkspace,
}: StudioMobileMenuProps) {
  const { t } = useTranslation()
  const closeMenu = useCallback(() => setSidebarOpen(false), [setSidebarOpen])
  const openSettings = useCallback(() => {
    setView('settings')
    setSidebarOpen(false)
  }, [setView, setSidebarOpen])

  const handlers = useStudioMobileMenuHandlers({
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
  })
  return (
    <StudioDrawer
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      title={t('Workspace menu')}
      modal={false}
      className="workspace-menu-drawer"
    >
      <aside
        ref={sidebarRef}
        aria-label={t('Workspace menu')}
        id="studio-navigation"
        className={`sidebar workspace-more-sheet ${sidebarOpen ? 'open' : ''}`}
      >
        <div className="mobile-sheet-heading">
          <strong>{t('Workspace')}</strong>
          <Button
            variant="ghost"
            className="icon-button"
            aria-label={t('Close workspace menu')}
            onClick={closeMenu}
          >
            <X size={20} />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="workspace-switch"
          aria-label={t('Switch workspace')}
          onClick={handlers.handleSwitchWorkspaceClick}
        >
          <span className="workspace-letter">
            {studio.name.slice(0, 1).toUpperCase()}
          </span>
          <span>
            {studio.name}
            <small>{t('Switch workspace')}</small>
          </span>
          <ChevronDown size={14} />
        </Button>
        <Button variant="ghost" className="button" onClick={openSettings}>
          <Settings size={18} />
          {t('Settings')}
        </Button>
        <ThemePicker />
        <LanguagePicker />
        <InstallApp />
        <StudioMobileTools state={state} handlers={handlers} />
      </aside>
    </StudioDrawer>
  )
}
