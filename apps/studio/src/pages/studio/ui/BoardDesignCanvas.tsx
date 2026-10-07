import { useCallback, useMemo, type ReactNode } from 'react'
import { DesignBoard } from './DesignBoard.tsx'
import type { StudioCanvasProps } from '../types/studioCanvasProps.ts'
import type { Workspace } from '@pomegranate/domain/workspace'
export function BoardDesignCanvas({
  studio,
  board,
  workspace,
  state,
  change,
  multiplayer,
  followed,
  sendPresence,
  navigation,
  mobileMenu,
}: StudioCanvasProps & { navigation: ReactNode }) {
  const design = useMemo(
    () => board.design || { ...workspace.design, pages: [] },
    [board.design, workspace.design],
  )
  const update = useCallback(
    (design: Workspace['design']) =>
      change((current) => ({
        ...current,
        boards: current.boards.map((item) =>
          item.id === board.id ? { ...item, design } : item,
        ),
      })),
    [board.id, change],
  )
  const peers = useMemo(
    () => multiplayer.peers.filter((peer) => peer.boardId === board.id),
    [multiplayer.peers, board.id],
  )
  return (
    <DesignBoard
      workspaceId={studio.id + ':' + board.id}
      design={design}
      update={update}
      saveState={state.saveState}
      peers={peers}
      following={followed?.boardId === board.id ? followed : null}
      sendPresence={sendPresence}
      navigation={navigation}
      mobileMenu={mobileMenu}
    />
  )
}
