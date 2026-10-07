import type { StudioView as View } from '@/shared/types/studioView.ts'
import { useEffect } from 'react'
import type { UseStudioFollowingProps } from '../types/useStudioFollowingProps.ts'
export function useStudioFollowing({
  multiplayer,
  followId,
  sendPresence,
  setFollowId,
  setNotice,
  t,
  workspace,
  setView,
  setCanvasMode,
  setBoardId,
  setRequirementId,
}: UseStudioFollowingProps) {
  const followedPeer = multiplayer.connected
    ? multiplayer.peers.find((p) => p.clientId === followId)
    : undefined
  const followed = followedPeer && !followedPeer.following ? followedPeer : null
  useEffect(() => {
    sendPresence({ following: followed?.clientId || null, cursor: null }, true)
  }, [followed?.clientId, sendPresence])
  useEffect(() => {
    if (!followId) return
    if (!followed) {
      setFollowId(null)
      setNotice(
        t(
          'Follow ended: that session disconnected or started following someone else.',
        ),
      )
      return
    }
    if (
      followed.view === 'canvas' ||
      followed.view === 'wireframes' ||
      (followed.view === 'design' && followed.boardId)
    ) {
      if (!workspace.boards.some((b) => b.id === followed.boardId)) return
      setView('canvas')
      setCanvasMode(followed.view)
      setBoardId(followed.boardId!)
    } else if (['requirements', 'design', 'notes'].includes(followed.view)) {
      setView(followed.view as View)
      if (followed.view === 'requirements')
        setRequirementId(followed.requirement?.id || null)
    }
  }, [
    followId,
    followed,
    setBoardId,
    setCanvasMode,
    setFollowId,
    setNotice,
    setRequirementId,
    setView,
    t,
    workspace.boards,
  ])
  useEffect(() => {
    if (!followId) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFollowId(null)
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [followId, setFollowId])
  return { followed }
}
