import { StudioSettings } from './StudioSettings.tsx'
import { LoadingStatus } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { AlertCircle, X } from 'lucide-react'
import { Suspense } from 'react'
import { useStudioContentHandlers } from '../model/useStudioContentHandlers.tsx'
import { DesignBoard } from './DesignBoard.tsx'
import { StudioScope } from './StudioScope.tsx'

import { StudioBottomNavigation } from './StudioBottomNavigation.tsx'
import { StudioCanvas } from './StudioCanvas.tsx'
import { StudioNotebook } from './StudioNotebook.tsx'

import type { StudioContentProps } from '../types/studioContentProps.ts'
export function StudioContent(props: StudioContentProps) {
  const { t } = useTranslation()

  const {
    state,
    multiplayer,
    setNotice,
    view,
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
  } = props

  const { handleImportWorkspaceFileChange } = useStudioContentHandlers({
    setNotice,
    setPendingImport,
    setModal,
  })
  return (
    <main className="main-area">
      {props.settings.role === 'viewer' && (
        <div className="workspace-readonly-notice">
          {t('View only · You can browse and follow collaborators.')}
        </div>
      )}
      {view !== 'canvas' && followStatus}
      {view === 'settings' && <StudioSettings {...props} />}
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
        {view === 'requirements' && <StudioScope {...props} />}
        {view === 'design' && (
          <DesignBoard
            key={props.studio.id}
            workspaceId={props.studio.id}
            saveState={state.saveState}
            design={workspace.design}
            update={(design) => change((w) => ({ ...w, design }))}
            peers={multiplayer.peers.filter((peer) => !peer.boardId)}
            following={followed?.boardId ? null : followed}
            sendPresence={sendPresence}
          />
        )}
        {view === 'notes' && <StudioNotebook {...props} />}
      </Suspense>
      <StudioBottomNavigation {...props} />
    </main>
  )
}
