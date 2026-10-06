import { demoTopics } from '../config/demoTopics.ts'
import { diffWorkspace } from '@pomegranate/domain/collaboration'
import type { Idea } from '@pomegranate/domain/workspace'
import type { DemoAction } from '../types/demoAction.ts'
import type { DemoState } from '../types/demoState.ts'
import { nextDemoRandom } from './nextDemoRandom.ts'
import { findDemoPlacement } from './findDemoPlacement.ts'

export function planDemoAction(
  state: DemoState,
  now: number,
): DemoAction | null {
  const planner = state.planner
  const random = () => nextDemoRandom(planner)
  const board = state.envelope.workspace.boards.find(
    (item) => item.id === 'layers',
  )
  if (!board) return null
  const busy = new Set(
    !state.presence.following &&
      state.presence.boardId === 'layers' &&
      state.presence.view === 'canvas'
      ? [
          ...(state.presence.selected || []),
          ...(state.presence.dragging?.map((item) => item.id) || []),
        ]
      : [],
  )
  const owned = board.nodes.filter(
    (node) =>
      planner.owned[node.id] &&
      !planner.protectedIds.includes(node.id) &&
      !busy.has(node.id) &&
      JSON.stringify(node) === JSON.stringify(planner.owned[node.id]),
  )
  const unlinked = owned.filter(
    (node) =>
      !board.edges.some(
        (edge) => edge.target === node.id || edge.source === node.id,
      ),
  )
  const disposable = owned.filter(
    (node) =>
      node.data.status === 'Decided' &&
      board.edges
        .filter((edge) => edge.target === node.id || edge.source === node.id)
        .every((edge) => edge.id.startsWith('demo-maya-edge-')),
  )
  const unfinished = owned.filter(
    (node) => node.data.status === 'Exploring' || unlinked.includes(node),
  )
  const active =
    unfinished.find((node) => planner.selected.includes(node.id)) ||
    unfinished[0]
  const movement =
    active && !planner.arrangedIds.includes(active.id)
      ? findDemoPlacement(board.nodes, active, random, true)
      : null
  // Finish a useful task before adding more. The board state chooses the next step.
  const options = active
    ? [
        ...(unlinked.includes(active) ? ['connect', 'connect'] : []),
        ...(movement ? ['move'] : []),
        ...(!unlinked.includes(active) && (!movement || random() < 0.35)
          ? ['refine']
          : []),
      ]
    : Object.keys(planner.owned).length +
          planner.protectedIds.filter((id) =>
            board.nodes.some((node) => node.id === id),
          ).length <
        3
      ? ['create']
      : disposable.length
        ? ['remove']
        : []
  if (!options.length) return null
  const intent = options[Math.floor(random() * options.length)]
  const target =
    intent === 'create'
      ? undefined
      : intent === 'remove'
        ? disposable[0]
        : active
  const changed = structuredClone(state.envelope.workspace)
  const nextBoard = changed.boards.find((item) => item.id === board.id)!
  let next: Idea | undefined
  let focus = target?.position
  let drag: DemoAction['drag']
  let message = ''
  let targetId = target?.id || ''
  if (intent === 'create') {
    const available = demoTopics.filter(
      (topic) =>
        !board.nodes.some((node) => node.data.title === topic.title) &&
        !planner.recentTopics.includes(topic.title) &&
        board.nodes.some((node) => node.id === topic.anchor),
    )
    if (!available.length) return null
    targetId = `demo-maya-idea-${++planner.sequence}`
    while (board.nodes.some((node) => node.id === targetId))
      targetId = `demo-maya-idea-${++planner.sequence}`
    const topic = available[Math.floor(random() * available.length)]
    const title = topic.title
    const anchor = board.nodes.find((node) => node.id === topic.anchor)!
    next = {
      id: targetId,
      type: 'idea',
      position: { ...anchor.position },
      data: {
        title,
        description: topic.description,
        kind: 'service',
        status: 'Exploring',
        notes:
          'An idea explored by Maya in the demo. Edit or connect it to keep it.',
        requirements: [topic.requirement],
      },
    }
    const position = findDemoPlacement(board.nodes, next, random)
    if (!position) return null
    next.position = position
    nextBoard.nodes.push(next)
    focus = position
    message = `Added ${title.toLowerCase()} to the deployment plan`
  } else if (target) {
    next = nextBoard.nodes.find((node) => node.id === target.id)!
    if (intent === 'move') {
      const position = movement
      if (!position) return null
      next.position = position
      drag = { from: target.position, to: position }
      message = `Aligned ${target.data.title.toLowerCase()} with the planning row`
    } else if (intent === 'connect') {
      const topic = demoTopics.find((item) => item.title === target.data.title)
      const anchor = board.nodes.find(
        (node) =>
          node.id === (topic?.anchor || 'template') && !busy.has(node.id),
      )
      if (!anchor) return null
      nextBoard.edges.push({
        id: `demo-maya-edge-${++planner.sequence}`,
        source: anchor.id,
        target: target.id,
        type: 'smoothstep',
        label: 'plan',
      })
      message = `Connected ${anchor.data.title.toLowerCase()} to ${target.data.title.toLowerCase()}`
    } else if (intent === 'refine') {
      next.data.status = 'Decided'
      next.data.notes +=
        '\nReview complete: define ownership, failure handling, and a visible result before implementation.'
      message = `Recorded the decision for ${target.data.title.toLowerCase()}`
    } else {
      nextBoard.nodes = nextBoard.nodes.filter((node) => node.id !== target.id)
      nextBoard.edges = nextBoard.edges.filter(
        (edge) => edge.source !== target.id && edge.target !== target.id,
      )
      next = undefined
      message = `Removed the explored ${target.data.title.toLowerCase()} idea`
    }
  }
  if (!focus) return null
  const path = ['boards', board.id, 'nodes', targetId]
  const operations = diffWorkspace(state.envelope.workspace, changed).filter(
    (op) => !path.every((part, index) => op.path[index] === part),
  )
  operations.push({
    path,
    before: target ? JSON.parse(JSON.stringify(target)) : undefined,
    after: next ? JSON.parse(JSON.stringify(next)) : undefined,
  })
  const approach = Math.max(
    1400,
    Math.hypot(
      focus.x + 70 - planner.cursor.x,
      focus.y + 25 - planner.cursor.y,
    ) * 6,
  )
  const work = drag
    ? Math.max(
        2000,
        Math.hypot(drag.to.x - drag.from.x, drag.to.y - drag.from.y) * 10,
      )
    : 2000 + random() * 1600
  const end = drag?.to || focus
  const recenter =
    Math.abs(end.x + 107 - planner.camera.x) > 250 ||
    Math.abs(end.y + 100 - planner.camera.y) > 170
  return {
    id: `adaptive-${++planner.sequence}`,
    intent,
    at: now - Date.parse(state.studio.createdAt),
    duration: approach + work + 650,
    peerId: 'demo-maya',
    view: 'canvas',
    boardId: board.id,
    targetId,
    operations,
    focus,
    drag,
    message,
    motion: {
      origin: { ...planner.cursor },
      camera: { ...planner.camera },
      destinationCamera: recenter
        ? { x: end.x + 107, y: end.y + 100, zoom: 0.72 }
        : { ...planner.camera },
      approach,
      work,
    },
  }
}
