import { useTranslation } from '@/shared/i18n/index.ts'
import { CollaborationBar } from '@/widgets/collaboration/index.ts'
import {
  AlertCircle,
  Check,
  LoaderCircle,
  Minimize2,
  Redo2,
  Undo2,
} from 'lucide-react'

import type { StudioHeaderActionsProps } from '../types/studioHeaderActionsProps.ts'
export function StudioHeaderActions({
  full,
  openSettings,
  view,
  state,
  collaborationPanel,
  setCollaborationPanel,
  studio,
  multiplayer,
  followId,
  setFollowId,
}: StudioHeaderActionsProps) {
  const { t } = useTranslation()

  return (
    <div className="topbar-actions">
      {full.fullscreen && view !== 'canvas' && (
        <button
          ref={full.button}
          className="icon-button"
          aria-label={t('Exit fullscreen')}
          title={t('Exit fullscreen (Esc)')}
          onClick={() => void full.toggle()}
        >
          <Minimize2 size={18} />
        </button>
      )}
      <button
        className={`save-indicator ${state.saveState}`}
        onClick={() => void state.flush()}
        title={state.error || t('Changes save automatically')}
      >
        {state.saveState === 'saved' ? (
          <Check size={14} />
        ) : state.saveState === 'error' ? (
          <AlertCircle size={14} />
        ) : (
          <LoaderCircle className="spinning" size={14} />
        )}
        <span>
          {state.saveState === 'saved'
            ? t('All changes saved')
            : state.saveState === 'error'
              ? t('Not saved · retry')
              : t('Saving changes')}
        </span>
      </button>
      <span className="toolbar-divider" />
      <button
        className="icon-button"
        aria-label={t('Undo')}
        title={t('Undo (Ctrl+Z)')}
        disabled={!state.canUndo}
        onClick={state.undo}
      >
        <Undo2 size={17} />
      </button>
      <button
        className="icon-button"
        aria-label={t('Redo')}
        title={t('Redo (Ctrl+Shift+Z)')}
        disabled={!state.canRedo}
        onClick={state.redo}
      >
        <Redo2 size={17} />
      </button>
      <CollaborationBar
        onSettings={openSettings}
        beforeLeave={state.flush}
        panel={collaborationPanel}
        setPanel={setCollaborationPanel}
        workspaceId={studio.id}
        profile={multiplayer.profile}
        peers={multiplayer.peers}
        activity={multiplayer.activity}
        connected={multiplayer.connected}
        onProfile={multiplayer.setProfile}
        followId={followId}
        onFollow={setFollowId}
      />
    </div>
  )
}
