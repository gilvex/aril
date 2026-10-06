import {
  applyOperations,
  diffWorkspace,
} from '@pomegranate/domain/collaboration'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import type { DemoState } from '../types/demoState.ts'
import { createDemoPeers } from './createDemoPeers.ts'
import { commitDemoChange } from './commitDemoChange.ts'

export function advanceDemoRehearsal(
  state: DemoState,
  storage: Pick<Storage, 'setItem'>,
  now = Date.now(),
) {
  const elapsed = now - Date.parse(state.studio.createdAt)
  const slot = Math.floor((elapsed - 5200) / 3500)
  if (
    slot < 0 ||
    slot <= state.rehearsalSlot ||
    state.activeAction ||
    state.rehearsalProtected
  )
    return
  const action = {
    ...state.rehearsalActions[slot % state.rehearsalActions.length],
    at: 5200 + slot * 3500,
  }
  const visitor = state.presence
  const busy =
    !visitor.following &&
    visitor.view === 'canvas' &&
    visitor.boardId === 'layers' &&
    (visitor.selected?.includes(action.targetId) ||
      visitor.dragging?.some((node) => node.id === action.targetId) ||
      visitor.selectedEdges?.includes('demo-maya-health-link'))
  try {
    if (busy || elapsed > action.at + action.duration + 500)
      throw new Error('Skip')
    const workspace = workspaceSchema.parse(
      applyOperations(state.envelope.workspace, action.operations),
    )
    if (!diffWorkspace(state.envelope.workspace, workspace).length)
      throw new Error('Already applied')
    if (elapsed < action.at + action.duration) {
      state.activeAction = action
      return
    }
    const maya = createDemoPeers(state, now).find(
      (peer) => peer.clientId === 'demo-maya',
    )!
    commitDemoChange(
      state,
      storage,
      workspace,
      maya.profile,
      action.message,
      state.completedActions,
      now,
    )
    state.rehearsalSlot = slot
  } catch {
    state.rehearsalSlot = slot
  }
}
