import { LoadingStatus } from '@/shared/ui/index.tsx'
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
      <Suspense fallback={<LoadingStatus centered label={t('Loading…')} />}>
        {view === 'requirements' && (
          <Requirements
            workspaceId={props.studio.id}
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
            key={props.studio.id}
            workspaceId={props.studio.id}
            saveState={state.saveState}
            design={workspace.design}
            update={(design) => change((w) => ({ ...w, design }))}
            peers={multiplayer.peers}
            following={followed}
            sendPresence={sendPresence}
          />
        )}
        {view === 'notes' && (
          <StudioNotes
            key={props.studio.id}
            workspace={workspace}
            change={change}
            workspaceId={props.studio.id}
            profileId={multiplayer.profile.id}
            peers={multiplayer.peers}
            sendPresence={sendPresence}
            followed={followed}
          />
        )}
      </Suspense>
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
