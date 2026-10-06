import { applyOperations } from '@pomegranate/domain/collaboration'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import type { DemoState } from '../types/demoState.ts'
import { planDemoAction } from './planDemoAction.ts'
import { sampleDemoPlannerPresence } from './sampleDemoPlannerPresence.ts'
import { nextDemoRandom } from './nextDemoRandom.ts'
import { isDemoPlacementClear } from './isDemoPlacementClear.ts'
import { commitDemoChange } from './commitDemoChange.ts'

export function advanceDemoPlanner(
  state: DemoState,
  storage: Pick<Storage, 'setItem'>,
  now = Date.now(),
) {
  const planner = state.planner
  const elapsed = now - Date.parse(state.studio.createdAt)
  const suspended = planner.lastTick > 0 && now - planner.lastTick > 1500
  planner.lastTick = now
  if (suspended) {
    planner.action = null
    planner.nextAt = elapsed + 3000
    return
  }
  if (!planner.action) {
    if (elapsed < planner.nextAt) return
    planner.action = planDemoAction(state, now)
    if (!planner.action) planner.nextAt = elapsed + 4000
    return
  }
  const action = planner.action
  const visitor = state.presence
  const busy =
    !visitor.following &&
    visitor.view === 'canvas' &&
    visitor.boardId === action.boardId &&
    (visitor.selected?.includes(action.targetId) ||
      visitor.dragging?.some((node) => node.id === action.targetId))
  try {
    if (busy || planner.protectedIds.includes(action.targetId))
      throw new Error('Visitor owns target')
    const workspace = workspaceSchema.parse(
      applyOperations(state.envelope.workspace, action.operations),
    )
    const board = state.envelope.workspace.boards.find(
      (item) => item.id === action.boardId,
    )!
    const nextNode = workspace.boards
      .find((item) => item.id === action.boardId)!
      .nodes.find((node) => node.id === action.targetId)
    if ((action.intent === 'create' || action.drag) && nextNode) {
      const moving = action.drag
        ? { ...nextNode, position: action.drag.from }
        : nextNode
      if (
        !isDemoPlacementClear(
          board.nodes,
          moving,
          nextNode.position,
          !!action.drag,
        )
      )
        throw new Error('Space became occupied')
    }
    const pose = sampleDemoPlannerPresence(state, now)
    if (pose.cursor && pose.camera) {
      planner.cursor = pose.cursor
      planner.camera = pose.camera
      planner.selected = pose.selected
    }
    if (elapsed < action.at + action.duration) return
    const owned = { ...planner.owned }
    if (nextNode) owned[nextNode.id] = structuredClone(nextNode)
    else delete owned[action.targetId]
    const previousOwned = planner.owned
    planner.owned = owned
    try {
      commitDemoChange(
        state,
        storage,
        workspace,
        {
          id: 'demo-maya',
          name: 'Maya · demo',
          avatar: '/demo-maya.svg',
          color: '#7e64ba',
        },
        action.message,
        state.completedActions,
        now,
      )
    } catch (error) {
      planner.owned = previousOwned
      throw error
    }
    planner.recent = [...planner.recent, action.intent!].slice(-8)
    planner.selected = nextNode ? [nextNode.id] : []
  } catch {
    planner.selected = []
  }
  // Keep the last cursor/camera pose; never snap back to an unrelated orbit.
  planner.action = null
  planner.nextAt = elapsed + 2200 + nextDemoRandom(planner) * 3600
}
