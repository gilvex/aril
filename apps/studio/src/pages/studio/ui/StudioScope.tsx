import { useCallback } from 'react'
import type { RequirementLink } from '@pomegranate/domain/workspace'
import type { StudioContentProps } from '../types/studioContentProps.ts'
import { Requirements } from './Requirements.tsx'
export function StudioScope(props: StudioContentProps) {
  const {
    studio,
    workspace,
    change,
    requirementId,
    setRequirementId,
    navigateBoard,
    multiplayer,
    sendPresence,
    setCanvasMode,
    setView,
  } = props
  const openWork = useCallback(
    (link: RequirementLink) => {
      if (link.kind === 'design' && link.pageId) {
        try {
          sessionStorage.setItem(
            `aril:designPage:${studio.id}${link.boardId ? ':' + link.boardId : ''}`,
            link.pageId,
          )
        } catch {
          /* The editor remains usable without storage. */
        }
      }
      if (link.boardId) {
        navigateBoard(link.boardId)
        setCanvasMode(link.kind)
      } else setView('design')
    },
    [studio.id, navigateBoard, setCanvasMode, setView],
  )
  return (
    <Requirements
      workspaceId={studio.id}
      workspace={workspace}
      change={change}
      selected={requirementId}
      onSelect={setRequirementId}
      openBoard={navigateBoard}
      openWork={openWork}
      profile={multiplayer.profile}
      peers={multiplayer.peers}
      sendPresence={sendPresence}
    />
  )
}
