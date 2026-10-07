import { StudioDrawer } from '@/shared/ui/index.tsx'
import { StudioMenuNavigation } from './StudioMenuNavigation.tsx'
import { useCallback } from 'react'
import { Settings } from 'lucide-react'
import { InstallApp } from '@/features/installApp/index.ts'
import { LanguagePicker } from '@/features/appearance/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useStudioMobileMenuHandlers } from '../model/useStudioMobileMenuHandlers.tsx'

import { ThemePicker } from '@/features/appearance/index.ts'
import {
  Activity as ActivityIcon,
  ChevronDown,
  Download,
  History,
  Redo2,
  Undo2,
  Upload,
  Workflow,
  X,
} from 'lucide-react'

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
  const openSettings = useCallback(() => {
    setView('settings')
    setSidebarOpen(false)
  }, [setView, setSidebarOpen])

  const {
    handleSwitchWorkspaceClick,
    handleClick,
    handleClick2,
    handleClick3,
    handleClick4,
    handleClick5,
  } = useStudioMobileMenuHandlers({
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
      side
    >
      <aside
        ref={sidebarRef}
        aria-label={t('Workspace menu')}
        id="studio-navigation"
        className={`sidebar workspace-more-sheet ${sidebarOpen ? 'open' : ''}`}
      >
        <div className="mobile-sheet-heading">
          <strong>{t('Workspace')}</strong>
          <button
            className="icon-button"
            aria-label={t('Close workspace menu')}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <button
          className="workspace-switch"
          aria-label={t('Switch workspace')}
          onClick={handleSwitchWorkspaceClick}
        >
          <span className="workspace-letter">
            {studio.name.slice(0, 1).toUpperCase()}
          </span>
          <span>
            {studio.name}
            <small>{t('Switch workspace')}</small>
          </span>
          <ChevronDown size={14} />
        </button>
        <button className="button" onClick={openSettings}>
          <Settings size={18} />
          {t('Settings')}
        </button>
        <StudioMenuNavigation
          setView={setView}
          setSidebarOpen={setSidebarOpen}
        />
        <ThemePicker />
        <LanguagePicker />
        <InstallApp />
        <div className="mobile-workspace-tools">
          <button onClick={handleClick}>
            <ActivityIcon size={18} />
            {t('Team activity')}
          </button>
          <button onClick={handleClick2}>
            <Workflow size={18} />
            {t('Agent access')}
          </button>
          <span>{t('Tools')}</span>
          <button disabled={!state.canUndo} onClick={state.undo}>
            <Undo2 size={18} />
            {t('Undo')}
          </button>
          <button disabled={!state.canRedo} onClick={state.redo}>
            <Redo2 size={18} />
            {t('Redo')}
          </button>
          <button onClick={handleClick3}>
            <History size={18} />
            {t('Revision history')}
          </button>
          <button onClick={handleClick4}>
            <Upload size={18} />
            {t('Import workspace')}
          </button>
          <button onClick={handleClick5}>
            <Download size={18} />
            {t('Export workspace')}
          </button>
        </div>
      </aside>
    </StudioDrawer>
  )
}
