import {
  applyOperations,
  diffWorkspace,
} from '@pomegranate/domain/collaboration'
import type { DemoState } from '../types/demoState.ts'
import { commitDemoChange } from './commitDemoChange.ts'
import { createDemoPeers } from './createDemoPeers.ts'

export function advanceDemoActions(
  state: DemoState,
  storage: Pick<Storage, 'setItem'>,
  now = Date.now(),
) {
  const elapsed = now - Date.parse(state.studio.createdAt)
  state.activeAction = null
  for (const action of state.actions) {
    if (elapsed < action.at || state.completedActions.includes(action.id))
      continue
    const visitor = state.presence
    const busy =
      !visitor.following &&
      visitor.view === action.view &&
      (action.view === 'requirements'
        ? visitor.requirement?.id === action.targetId
        : action.view === 'notes'
          ? visitor.selected?.includes(`note:${action.targetId}`)
          : visitor.boardId === action.boardId &&
            (visitor.selected?.includes(action.targetId) ||
              visitor.dragging?.some((item) => item.id === action.targetId)))
    try {
      // Do not replay missed actions after a suspended tab or fight visitor edits.
      if (busy || elapsed > action.at + action.duration + 2000)
        throw new Error('Skip')
      const workspace = applyOperations(
        state.envelope.workspace,
        action.operations,
      )
      if (!diffWorkspace(state.envelope.workspace, workspace).length)
        throw new Error('Already applied')
      if (elapsed < action.at + action.duration) {
        state.activeAction = action
        return
      }
      const peer = createDemoPeers(state, now).find(
        (item) => item.clientId === action.peerId,
      )!
      commitDemoChange(
        state,
        storage,
        workspace,
        peer.profile,
        action.message,
        [...state.completedActions, action.id],
        now,
      )
    } catch {
      // Includes changed/deleted targets and full storage: clear the preview safely.
      state.completedActions.push(action.id)
    }
  }
}
