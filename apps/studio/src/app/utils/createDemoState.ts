import { workspaceSchema } from '@pomegranate/domain/workspace'
import type { DemoState } from '../types/demoState.ts'
import { demoStorageKey } from '../config/demoStorageKey.ts'
import { createDemoWorkspace } from './createDemoWorkspace.ts'

export function createDemoState(storage: Pick<Storage, 'getItem'>): DemoState {
  const now = new Date().toISOString()
  const envelope = {
    workspace: createDemoWorkspace(),
    revision: 1,
    savedAt: now,
  }
  const state: DemoState = {
    profile: {
      id: 'demo-visitor',
      name: 'You · demo',
      avatar: '',
      color: '#b34568',
    },
    studio: {
      id: 'demo',
      name: 'Game hosting · demo',
      role: 'owner',
      createdAt: now,
    },
    envelope,
    history: [structuredClone(envelope)],
    presence: {},
    activity: [
      {
        id: 3,
        userId: 'demo-maya',
        name: 'Maya · demo',
        message: 'Connected the recipe wireframes',
        createdAt: now,
      },
      {
        id: 2,
        userId: 'demo-noah',
        name: 'Noah · demo',
        message: 'Reviewed reusable game layer requirements',
        createdAt: now,
      },
      {
        id: 1,
        userId: 'demo-maya',
        name: 'Maya · demo',
        message: 'Created the example deployment blueprint',
        createdAt: now,
      },
    ],
  }
  try {
    const saved = JSON.parse(storage.getItem(demoStorageKey) || 'null')
    if (
      saved?.envelope &&
      Number.isSafeInteger(saved.envelope.revision) &&
      saved.envelope.revision > 0
    ) {
      state.envelope = {
        ...saved.envelope,
        workspace: workspaceSchema.parse(saved.envelope.workspace),
      }
      state.history = (saved.history || [])
        .slice(0, 30)
        .map((item: DemoState['envelope']) => ({
          ...item,
          workspace: workspaceSchema.parse(item.workspace),
        }))
    }
  } catch {
    /* Invalid or older demo data starts a fresh sandbox. */
  }
  return state
}
