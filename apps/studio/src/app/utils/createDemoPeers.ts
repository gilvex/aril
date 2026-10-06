import type { Presence } from '@pomegranate/domain/collaboration'
import type { DemoState } from '../types/demoState.ts'
import { sampleDemoCursor } from './sampleDemoCursor.ts'

export function createDemoPeers(
  state: DemoState,
  now = Date.now(),
): Presence[] {
  const elapsed = Math.max(0, now - Date.parse(state.studio.createdAt))
  const board = state.envelope.workspace.boards.find(
    (item) => item.id === 'layers',
  )
  const mayaTargets = ['game', 'template', 'eu', 'logs', 'base'].flatMap(
    (id, index) => {
      const node = board?.nodes.find((item) => item.id === id)
      return node
        ? [
            {
              id,
              x: node.position.x + 60 + (index % 2) * 65,
              y: node.position.y + 65,
              pause: [3100, 4600, 2400, 5200, 3300][index],
            },
          ]
        : []
    },
  )
  const noahTargets = [
    'runtime-heading',
    'runtime-content',
    'runtime-next',
    'game-content',
    'game-next',
  ].flatMap((id, index) => {
    const node = board?.wireframe?.nodes.find((item) => item.id === id)
    const parent = board?.wireframe?.nodes.find(
      (item) => item.id === node?.parentId,
    )
    return node
      ? [
          {
            id,
            x: node.position.x + (parent?.position.x || 0) + 70,
            y: node.position.y + (parent?.position.y || 0) + 25,
            pause: [4200, 6000, 1800, 5100, 2900][index],
          },
        ]
      : []
  })
  const maya = sampleDemoCursor(mayaTargets, elapsed)
  const noah = sampleDemoCursor(noahTargets, elapsed + 2300)
  const requirement = state.envelope.workspace.requirements.find(
    (item) => item.id === (Math.floor(elapsed / 26000) % 2 ? 'R01' : 'R13'),
  )
  const note = state.envelope.workspace.documents?.find(
    (item) => item.id === 'recipe-decisions',
  )
  return [
    {
      clientId: 'demo-maya',
      profile: {
        id: 'demo-maya',
        name: 'Maya · demo',
        color: '#7e64ba',
        avatar: '/demo-maya.svg',
      },
      boardId: board?.id || null,
      view: 'canvas',
      ...maya,
      selectedEdges: [],
      seenAt: now,
      camera: board ? { x: 600, y: 300, zoom: 0.8 } : null,
    },
    {
      clientId: 'demo-noah',
      profile: {
        id: 'demo-noah',
        name: 'Noah · demo',
        color: '#359381',
        avatar: '/demo-noah.svg',
      },
      boardId: board?.id || null,
      view: 'wireframes',
      ...noah,
      selectedEdges: [],
      seenAt: now,
      camera: board ? { x: 1060, y: 270, zoom: 0.85 } : null,
    },
    {
      clientId: 'demo-iris',
      profile: {
        id: 'demo-iris',
        name: 'Iris · demo',
        color: '#bd7840',
        avatar: '/demo-iris.svg',
      },
      boardId: null,
      view: 'requirements',
      cursor: null,
      selected: [],
      seenAt: now,
      camera: null,
      requirement: requirement
        ? {
            id: requirement.id,
            field: 'acceptance',
            typing: elapsed % 14000 > 4500 && elapsed % 14000 < 8200,
          }
        : null,
    },
    {
      clientId: 'demo-leo',
      profile: {
        id: 'demo-leo',
        name: 'Leo · demo',
        color: '#527ba7',
        avatar: '/demo-leo.svg',
      },
      boardId: null,
      view: 'notes',
      cursor: null,
      selected: note
        ? [
            `note:${note.id}`,
            ...(elapsed % 19000 > 11000 ? ['note-field:body'] : []),
          ]
        : [],
      seenAt: now,
      camera: null,
    },
  ]
}
