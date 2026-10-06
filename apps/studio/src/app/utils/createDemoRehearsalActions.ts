import { diffWorkspace } from '@pomegranate/domain/collaboration'
import type { Workspace } from '@pomegranate/domain/workspace'
import type { DemoAction } from '../types/demoAction.ts'
import { demoRehearsalNodeId } from '../config/demoRehearsalNodeId.ts'

export function createDemoRehearsalActions(seed: Workspace): DemoAction[] {
  let previous = structuredClone(seed)
  const actions: DemoAction[] = []
  const id = demoRehearsalNodeId
  const add = (
    message: string,
    edit: (workspace: Workspace) => void,
    drag?: DemoAction['drag'],
  ) => {
    const next = structuredClone(previous)
    edit(next)
    const before = previous.boards[0].nodes.find((node) => node.id === id)
    const after = next.boards[0].nodes.find((node) => node.id === id)
    const operations = diffWorkspace(previous, next)
    // Whole-node preconditions protect visitor changes to any field.
    const nodePath = ['boards', 'layers', 'nodes', id]
    const filtered = operations.filter(
      (op) => !nodePath.every((part, index) => op.path[index] === part),
    )
    filtered.push({
      path: nodePath,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: after ? JSON.parse(JSON.stringify(after)) : undefined,
    })
    actions.push({
      id: `demo-rehearsal-${actions.length}`,
      at: 5200 + actions.length * 3500,
      duration: 1200,
      peerId: 'demo-maya',
      view: 'canvas',
      boardId: 'layers',
      targetId: id,
      message,
      operations: filtered,
      focus: before?.position || after?.position,
      drag,
    })
    previous = next
  }
  add('Created a health-check idea', (workspace) => {
    workspace.boards[0].nodes.push({
      id,
      type: 'idea',
      position: { x: 290, y: 430 },
      data: {
        title: 'Health check',
        description:
          'Check that each new server is ready before accepting players.',
        kind: 'service',
        status: 'Exploring',
        notes: 'A temporary example created by Maya. Edit it to keep it.',
        requirements: [],
      },
    })
  })
  add('Connected the blueprint to its health check', (workspace) => {
    workspace.boards[0].edges.push({
      id: 'demo-maya-health-link',
      source: 'template',
      target: id,
      label: 'verify readiness',
      type: 'smoothstep',
    })
  })
  add(
    'Moved the health check beside the server flow',
    (workspace) => {
      workspace.boards[0].nodes.find((node) => node.id === id)!.position = {
        x: 300,
        y: 300,
      }
    },
    { from: { x: 290, y: 430 }, to: { x: 300, y: 300 } },
  )
  add('Refined the health-check name and decision', (workspace) => {
    const node = workspace.boards[0].nodes.find((node) => node.id === id)!
    node.data.title = 'Readiness probe'
    node.data.status = 'Decided'
  })
  add(
    'Rearranged the readiness probe',
    (workspace) => {
      workspace.boards[0].nodes.find((node) => node.id === id)!.position = {
        x: 250,
        y: 460,
      }
    },
    { from: { x: 300, y: 300 }, to: { x: 250, y: 460 } },
  )
  add('Removed the temporary probe and its connection', (workspace) => {
    workspace.boards[0].nodes = workspace.boards[0].nodes.filter(
      (node) => node.id !== id,
    )
    workspace.boards[0].edges = workspace.boards[0].edges.filter(
      (edge) => edge.id !== 'demo-maya-health-link',
    )
  })
  return actions
}
