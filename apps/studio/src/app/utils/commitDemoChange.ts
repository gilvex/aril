import type { Workspace } from '@pomegranate/domain/workspace'
import type { Profile } from '@pomegranate/domain/collaboration'
import type { DemoState } from '../types/demoState.ts'
import { demoStorageKey } from '../config/demoStorageKey.ts'

export function commitDemoChange(
  state: DemoState,
  storage: Pick<Storage, 'setItem'>,
  workspace: Workspace,
  profile: Profile,
  message: string,
  completed = state.completedActions,
  now = Date.now(),
) {
  const planner = {
    ...state.planner,
    owned: { ...state.planner.owned },
    protectedIds: [...state.planner.protectedIds],
  }
  if (profile.id === state.profile.id) {
    const before = state.envelope.workspace.boards.find(
      (board) => board.id === 'layers',
    )
    const after = workspace.boards.find((board) => board.id === 'layers')
    for (const id of Object.keys(planner.owned)) {
      const nodeBefore = before?.nodes.find((node) => node.id === id)
      const nodeAfter = after?.nodes.find((node) => node.id === id)
      const edgesBefore = before?.edges.filter(
        (edge) => edge.source === id || edge.target === id,
      )
      const edgesAfter = after?.edges.filter(
        (edge) => edge.source === id || edge.target === id,
      )
      if (
        JSON.stringify(nodeBefore) !== JSON.stringify(nodeAfter) ||
        JSON.stringify(edgesBefore) !== JSON.stringify(edgesAfter)
      ) {
        planner.protectedIds.push(id)
        delete planner.owned[id]
      }
    }
  }
  const envelope = {
    workspace,
    revision: state.envelope.revision + 1,
    savedAt: new Date(now).toISOString(),
  }
  const history = [envelope, ...state.history].slice(0, 30)
  const activity = [
    {
      id: now,
      userId: profile.id,
      name: profile.name,
      message,
      createdAt: envelope.savedAt,
    },
    ...state.activity,
  ].slice(0, 50)
  // Persist before publishing, so storage failures never announce an unsaved edit.
  storage.setItem(
    demoStorageKey,
    JSON.stringify({
      envelope,
      history,
      activity,
      completedActions: completed,
      planner: {
        seed: planner.seed,
        sequence: planner.sequence,
        owned: planner.owned,
        protectedIds: planner.protectedIds,
        recent: planner.recent,
        arrangedIds: planner.arrangedIds,
        recentTopics: planner.recentTopics,
      },
    }),
  )
  Object.assign(state, {
    envelope,
    history,
    activity,
    completedActions: completed,
  })
  Object.assign(state.planner, planner)
  return envelope
}
