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
    }),
  )
  Object.assign(state, {
    envelope,
    history,
    activity,
    completedActions: completed,
  })
  return envelope
}
