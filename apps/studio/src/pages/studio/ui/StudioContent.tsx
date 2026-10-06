import { useTranslation } from '@/shared/i18n/index.ts'
import { AlertCircle, X } from 'lucide-react'
import { Suspense } from 'react'
import { useStudioContentHandlers } from '../model/useStudioContentHandlers.tsx'
import { DesignBoard } from './DesignBoard.tsx'
import { Requirements } from './Requirements.tsx'

import { StudioBottomNavigation } from './StudioBottomNavigation.tsx'
import { StudioCanvas } from './StudioCanvas.tsx'
import { StudioHeader } from './StudioHeader.tsx'
import { StudioNotes } from './StudioNotes.tsx'

import type { StudioContentProps } from '../types/studioContentProps.ts'
export function StudioContent(props: StudioContentProps) {
  const { t } = useTranslation()

  const {
    compact,
    sidebarOpen,
    state,
    multiplayer,
    setNotice,
    view,
    setRequirementId,
    setModal,
    importRef,
    exportWorkspace,
    followStatus,
    setPendingImport,
    notice,
    followed,
    workspace,
    change,
    sendPresence,
    requirementId,
    navigateBoard,
  } = props

  const { handleImportWorkspaceFileChange } = useStudioContentHandlers({
    setNotice,
    setPendingImport,
    setModal,
  })
  return (
    <main className="main-area" inert={compact && sidebarOpen}>
      <StudioHeader {...props} />
      {view !== 'canvas' && followStatus}
      <input
        className="visually-hidden"
        ref={importRef}
        type="file"
        accept=".json,application/json"
        aria-label={t('Import workspace file')}
        onChange={handleImportWorkspaceFileChange}
      />
      {state.error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{state.error}</span>
          <button onClick={exportWorkspace}>{t('Export my edits')}</button>
          <button onClick={() => setModal('reload')}>
            {t('Reload saved version')}
          </button>
        </div>
      )}
      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label={t('Dismiss notification')}
            onClick={() => setNotice('')}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {view === 'canvas' && (
        <>
          <StudioCanvas {...props} followed={followed} />
        </>
      )}
      <Suspense fallback={<div className="empty-message">{t('Loading…')}</div>}>
        {view === 'requirements' && (
          <Requirements
            workspace={workspace}
            change={change}
            selected={requirementId}
            onSelect={setRequirementId}
            openBoard={navigateBoard}
            profile={multiplayer.profile}
            peers={multiplayer.peers}
            sendPresence={sendPresence}
          />
        )}
        {view === 'design' && (
          <DesignBoard
            design={workspace.design}
            update={(design) => change((w) => ({ ...w, design }))}
          />
        )}
      </Suspense>
      {view === 'notes' && (
        <StudioNotes workspace={workspace} change={change} />
      )}
      <footer className="statusbar">
        <span>
          <span className="small-dot" />
          {t('Planning, not production')}
        </span>
        <span>
          {t('boardCount', { count: workspace.boards.length })}
          <span className="status-separator">·</span>
          {t('requirementCount', { count: workspace.requirements.length })}
          <span className="status-separator">·</span>
          {t('Revision')} {state.revision}
        </span>
      </footer>
      <StudioBottomNavigation {...props} />
    </main>
  )
}
