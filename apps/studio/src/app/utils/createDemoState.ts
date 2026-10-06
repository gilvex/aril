import { workspaceSchema } from '@pomegranate/domain/workspace'
import type { DemoState } from '../types/demoState.ts'
import { demoStorageKey } from '../config/demoStorageKey.ts'
import { createDemoWorkspace } from './createDemoWorkspace.ts'
import { createDemoActions } from './createDemoActions.ts'

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
    actions: createDemoActions(envelope.workspace),
    completedActions: [],
    activeAction: null,
    planner: {
      seed: Math.floor(Math.random() * 4294967295) + 1,
      sequence: 0,
      owned: {},
      protectedIds: [],
      recent: [],
      arrangedIds: [],
      recentTopics: [],
      nextAt: 3500,
      lastTick: 0,
      action: null,
      cursor: { x: 650, y: 230 },
      camera: { x: 650, y: 300, zoom: 0.8 },
      selected: [],
    },
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
      state.completedActions = Array.isArray(saved.completedActions)
        ? saved.completedActions.filter((id: unknown) => typeof id === 'string')
        : []
      if (Array.isArray(saved.activity))
        state.activity = saved.activity.slice(0, 50)
      if (
        saved.planner &&
        Number.isSafeInteger(saved.planner.sequence) &&
        typeof saved.planner.seed === 'number'
      ) {
        state.planner.sequence = saved.planner.sequence
        state.planner.seed = saved.planner.seed >>> 0
        state.planner.protectedIds = Array.isArray(saved.planner.protectedIds)
          ? saved.planner.protectedIds.filter(
              (id: unknown) => typeof id === 'string',
            )
          : []
        state.planner.recent = Array.isArray(saved.planner.recent)
          ? saved.planner.recent.slice(-8)
          : []
        const nodes =
          state.envelope.workspace.boards.find((board) => board.id === 'layers')
            ?.nodes || []
        state.planner.arrangedIds = Array.isArray(saved.planner.arrangedIds)
          ? saved.planner.arrangedIds.filter(
              (id: unknown) => typeof id === 'string',
            )
          : []
        state.planner.recentTopics = Array.isArray(saved.planner.recentTopics)
          ? saved.planner.recentTopics
              .filter((title: unknown) => typeof title === 'string')
              .slice(-8)
          : []
        for (const node of nodes) {
          if (
            node.id.startsWith('demo-maya-idea-') &&
            !state.planner.protectedIds.includes(node.id) &&
            JSON.stringify(saved.planner.owned?.[node.id]) ===
              JSON.stringify(node)
          )
            state.planner.owned[node.id] = structuredClone(node)
        }
      }
    }
  } catch {
    /* Invalid or older demo data starts a fresh sandbox. */
  }
  return state
}
