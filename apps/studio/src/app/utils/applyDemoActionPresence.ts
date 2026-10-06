import type { Presence } from '@pomegranate/domain/collaboration'
import type { DemoState } from '../types/demoState.ts'
import { sampleDemoCurve } from './sampleDemoCurve.ts'

export function applyDemoActionPresence(
  peers: Presence[],
  state: DemoState,
  now: number,
) {
  const action = state.activeAction
  if (!action) return peers
  const progress = Math.max(
    0,
    Math.min(
      1,
      (now - Date.parse(state.studio.createdAt) - action.at) / action.duration,
    ),
  )
  return peers.map((peer) => {
    if (peer.clientId !== action.peerId) return peer
    const position = action.drag
      ? sampleDemoCurve(
          action.drag.from,
          action.drag.to,
          Math.max(0, Math.min(1, (progress - 0.22) / 0.6)),
        )
      : null
    const focus = action.focus
      ? {
          x:
            action.focus.x +
            (position && action.drag ? position.x - action.drag.from.x : 0) +
            70,
          y:
            action.focus.y +
            (position && action.drag ? position.y - action.drag.from.y : 0) +
            25,
        }
      : null
    const blend = Math.min(1, progress / 0.22, (1 - progress) / 0.15)
    const camera = focus
      ? { x: focus.x + 70, y: focus.y + 60, zoom: 0.9 }
      : null
    return {
      ...peer,
      view: action.view,
      boardId: action.boardId,
      cursor:
        focus && peer.cursor
          ? sampleDemoCurve(peer.cursor, focus, blend)
          : focus,
      camera:
        camera && peer.camera
          ? {
              ...sampleDemoCurve(peer.camera, camera, blend),
              zoom: peer.camera.zoom + (camera.zoom - peer.camera.zoom) * blend,
            }
          : camera,
      selected:
        action.view === 'notes'
          ? [`note:${action.targetId}`, 'note-field:body']
          : [action.targetId],
      dragging: position ? [{ id: action.targetId, position }] : [],
      requirement:
        action.view === 'requirements'
          ? {
              id: action.targetId,
              field: action.field || 'status',
              typing: true,
            }
          : null,
    }
  })
}
