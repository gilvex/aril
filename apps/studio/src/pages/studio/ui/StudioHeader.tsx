import { useTranslation } from '@/shared/i18n/index.ts'
import { useStudioHeaderHandlers } from '../model/useStudioHeaderHandlers.tsx'

import { ChevronDown } from 'lucide-react'

import { StudioDesktopNavigation } from './StudioDesktopNavigation.tsx'
import { StudioHeaderActions } from './StudioHeaderActions.tsx'

import type { StudioHeaderProps } from '../types/studioHeaderProps.ts'
export function StudioHeader({
  state,
  onWorkspaces,
  multiplayer,
  setNotice,
  studio,
  compact,
  view,
  setView,
  setRequirementId,
  present,
  actionsMenu,
  setCollaborationPanel,
  setModal,
  loadHistory,
  importRef,
  exportWorkspace,
  full,
  collaborationPanel,
  followId,
  setFollowId,
}: StudioHeaderProps) {
  const { t } = useTranslation()

  const { handleSwitchWorkspaceClick } = useStudioHeaderHandlers({
    state,
    onWorkspaces,
    multiplayer,
    setNotice,
  })
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <button
          className="app-workspace-picker"
          title={t('Switch workspace')}
          onClick={handleSwitchWorkspaceClick}
        >
          <img src="/aril.svg" alt="" />
          <span>{studio.name}</span>
          <ChevronDown size={14} />
        </button>
      </div>
      {!compact && (
        <StudioDesktopNavigation
          view={view}
          setView={setView}
          setRequirementId={setRequirementId}
          present={present}
          actionsMenu={actionsMenu}
          setCollaborationPanel={setCollaborationPanel}
          setModal={setModal}
          loadHistory={loadHistory}
          importRef={importRef}
          exportWorkspace={exportWorkspace}
        />
      )}
      <StudioHeaderActions
        full={full}
        view={view}
        state={state}
        collaborationPanel={collaborationPanel}
        setCollaborationPanel={setCollaborationPanel}
        studio={studio}
        multiplayer={multiplayer}
        followId={followId}
        setFollowId={setFollowId}
      />
    </header>
  )
}
