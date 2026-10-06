import { diffWorkspace } from '@pomegranate/domain/collaboration'
import type { Workspace } from '@pomegranate/domain/workspace'
import type { DemoAction } from '../types/demoAction.ts'

export function createDemoActions(seed: Workspace): DemoAction[] {
  const actions: DemoAction[] = []
  const add = (
    action: Omit<DemoAction, 'operations' | 'id' | 'at' | 'duration'>,
    edit: (workspace: Workspace) => void,
  ) => {
    const changed = structuredClone(seed)
    edit(changed)
    actions.push({
      ...action,
      id: `demo-edit-${actions.length}`,
      at: 3000 + actions.length * 10000,
      duration: 4200,
      operations: diffWorkspace(seed, changed),
    })
  }
  const board = seed.boards.find((item) => item.id === 'layers')!
  const game = board.nodes.find((node) => node.id === 'game')!
  const gameTo = { x: game.position.x + 30, y: game.position.y - 70 }
  add(
    {
      peerId: 'demo-maya',
      view: 'canvas',
      boardId: 'layers',
      targetId: 'game',
      message: 'Moved the game layer to clarify the recipe flow',
      drag: { from: game.position, to: gameTo },
      focus: game.position,
    },
    (workspace) => {
      workspace.boards[0].nodes.find((node) => node.id === 'game')!.position =
        gameTo
    },
  )
  const block = board.wireframe!.nodes.find(
    (node) => node.id === 'runtime-content',
  )!
  const parent = board.wireframe!.nodes.find(
    (node) => node.id === block.parentId,
  )!
  const blockTo = { x: block.position.x, y: block.position.y + 18 }
  add(
    {
      peerId: 'demo-noah',
      view: 'wireframes',
      boardId: 'layers',
      targetId: block.id,
      message: 'Adjusted spacing in the runtime recipe screen',
      drag: { from: block.position, to: blockTo },
      focus: {
        x: parent.position.x + block.position.x,
        y: parent.position.y + block.position.y,
      },
    },
    (workspace) => {
      workspace.boards[0].wireframe!.nodes.find(
        (node) => node.id === block.id,
      )!.position = blockTo
    },
  )
  add(
    {
      peerId: 'demo-iris',
      view: 'requirements',
      boardId: null,
      targetId: 'R02',
      field: 'status',
      message: 'Marked session control ready for implementation',
    },
    (workspace) => {
      workspace.requirements.find((item) => item.id === 'R02')!.status = 'Ready'
    },
  )
  add(
    {
      peerId: 'demo-leo',
      view: 'notes',
      boardId: null,
      targetId: 'recipe-decisions',
      message: 'Recorded the port validation decision',
    },
    (workspace) => {
      const note = workspace.documents!.find(
        (item) => item.id === 'recipe-decisions',
      )!
      note.body =
        note.body.replace(
          '- [ ] Validate host port conflicts',
          '- [x] Validate host port conflicts',
        ) +
        '\n\nPort validation runs before launch and reports conflicts per instance.'
    },
  )
  const template = board.nodes.find((node) => node.id === 'template')!
  add(
    {
      peerId: 'demo-maya',
      view: 'canvas',
      boardId: 'layers',
      targetId: 'template',
      focus: template.position,
      message: 'Clarified the server blueprint configuration',
    },
    (workspace) => {
      workspace.boards[0].nodes.find(
        (node) => node.id === 'template',
      )!.data.description =
        'Startup command, isolated volumes, resource limits, and validated environment variables.'
    },
  )
  const button = board.wireframe!.nodes.find(
    (node) => node.id === 'runtime-next',
  )!
  add(
    {
      peerId: 'demo-noah',
      view: 'wireframes',
      boardId: 'layers',
      targetId: button.id,
      focus: {
        x: parent.position.x + button.position.x,
        y: parent.position.y + button.position.y,
      },
      message: 'Clarified the runtime build action',
    },
    (workspace) => {
      workspace.boards[0].wireframe!.nodes.find(
        (node) => node.id === button.id,
      )!.data.title = 'Build & version runtime'
    },
  )
  add(
    {
      peerId: 'demo-iris',
      view: 'requirements',
      boardId: null,
      targetId: 'R03',
      field: 'status',
      message: 'Started designing projects and saved views',
    },
    (workspace) => {
      workspace.requirements.find((item) => item.id === 'R03')!.status =
        'Designing'
    },
  )
  add(
    {
      peerId: 'demo-leo',
      view: 'notes',
      boardId: null,
      targetId: 'release-plan',
      message: 'Added a recipe walkthrough to the release checklist',
    },
    (workspace) => {
      workspace.documents!.find((item) => item.id === 'release-plan')!.body +=
        '\n\n## Next review\nWalk through runtime → game layer → blueprint with two independently configured servers.'
    },
  )
  return actions.filter((action) => action.peerId !== 'demo-maya')
}
