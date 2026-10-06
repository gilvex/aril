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
  const unrefined = owned.filter((node) => node.data.status === 'Exploring')
  const disposable = owned.filter(
    (node) =>
      node.data.status === 'Decided' &&
      board.edges
        .filter((edge) => edge.target === node.id || edge.source === node.id)
        .every((edge) => edge.id.startsWith('demo-maya-edge-')),
  )
  const options = [
    ...(Object.keys(planner.owned).length + planner.protectedIds.length < 7
      ? Array(owned.length < 3 ? 5 : 2).fill('create')
      : []),
    ...(unlinked.length ? ['connect', 'connect', 'connect'] : []),
    ...(owned.length ? ['move', 'move', 'move'] : []),
    ...(unrefined.length ? ['refine', 'refine'] : []),
    ...(owned.length >= 4 && disposable.length ? ['remove', 'remove'] : []),
  ] as string[]
  const varied = options.filter((option) => option !== planner.recent.at(-1))
  const choices = varied.length ? varied : options
  if (!choices.length) return null
  const intent = choices[Math.floor(random() * choices.length)]
  const pool =
    intent === 'connect'
      ? unlinked
      : intent === 'refine'
        ? unrefined
        : intent === 'remove'
          ? disposable
          : owned
  const target =
    intent !== 'create' && pool.length
      ? pool[Math.floor(random() * pool.length)]
      : undefined
  const changed = structuredClone(state.envelope.workspace)
  const nextBoard = changed.boards.find((item) => item.id === board.id)!
  let next: Idea | undefined
  let focus = target?.position
  let drag: DemoAction['drag']
  let message = ''
  let targetId = target?.id || ''
  if (intent === 'create') {
    const topics = [
      'Readiness probe',
      'Backup schedule',
      'Metrics collector',
      'Log archive',
      'Release gate',
      'Secret store',
      'Resource monitor',
      'Update policy',
      'Recovery plan',
      'Network policy',
      'Build cache',
      'Audit trail',
    ]
    const available = topics.filter(
      (title) => !board.nodes.some((node) => node.data.title === title),
    )
    if (!available.length) return null
    targetId = `demo-maya-idea-${++planner.sequence}`
    while (board.nodes.some((node) => node.id === targetId))
      targetId = `demo-maya-idea-${++planner.sequence}`
    const title = available[Math.floor(random() * available.length)]
    next = {
      id: targetId,
      type: 'idea',
      position: { x: planner.cursor.x - 70, y: planner.cursor.y - 25 },
      data: {
        title,
        description: `Define ${title.toLowerCase()} for independently configured servers.`,
        kind: 'service',
        status: 'Exploring',
        notes:
          'An idea explored by Maya in the demo. Edit or connect it to keep it.',
        requirements: [],
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
      const position = findDemoPlacement(board.nodes, target, random, true)
      if (!position) return null
      next.position = position
      drag = { from: target.position, to: position }
      message = `Made room around ${target.data.title.toLowerCase()}`
    } else if (intent === 'connect') {
      const anchors = board.nodes.filter(
        (node) => node.id !== target.id && !busy.has(node.id),
      )
      anchors.sort(
        (a, b) =>
          Math.hypot(
            a.position.x - target.position.x,
            a.position.y - target.position.y,
          ) -
          Math.hypot(
            b.position.x - target.position.x,
            b.position.y - target.position.y,
          ),
      )
      const anchor = anchors[Math.floor(random() * Math.min(3, anchors.length))]
      if (!anchor) return null
      nextBoard.edges.push({
        id: `demo-maya-edge-${++planner.sequence}`,
        source: anchor.id,
        target: target.id,
        type: 'smoothstep',
        label: 'supports',
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
        ? { x: end.x + 107, y: end.y + 100, zoom: 0.78 + random() * 0.1 }
        : { ...planner.camera },
      approach,
      work,
    },
  }
}
