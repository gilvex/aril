import { useCallback, useMemo } from 'react'
import { DesignBoard } from './DesignBoard.tsx'
import type { StudioContentProps } from '../types/studioContentProps.ts'
import type { Workspace } from '@aril/domain/workspace'
export function StudioDesign({
  studio,
  state,
  workspace,
  change,
  multiplayer,
  followed,
  sendPresence,
  libraryNavigation,
}: StudioContentProps) {
  const { open, target, boardId, consume } = libraryNavigation
  const openLibrary = useCallback(
    (tab?: 'graph' | 'variables') => open(null, tab),
    [open],
  )
  const update = useCallback(
    (design: Workspace['design']) => change((w) => ({ ...w, design })),
    [change],
  )
  const peers = useMemo(
    () => multiplayer.peers.filter((peer) => !peer.boardId),
    [multiplayer.peers],
  )
  return (
    <DesignBoard
      workspaceId={studio.id}
      design={workspace.design}
      update={update}
      saveState={state.saveState}
      peers={peers}
      following={followed?.boardId ? null : followed}
      sendPresence={sendPresence}
      onOpenLibrary={openLibrary}
      initialEditorState={!boardId ? target || undefined : undefined}
      onEditorReady={consume}
    />
  )
}
