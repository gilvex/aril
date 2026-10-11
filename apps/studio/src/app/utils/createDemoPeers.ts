import { designPosition } from '@pomegranate/domain/design'
import type { Presence } from '@pomegranate/domain/collaboration'
import type { DemoState } from '../types/demoState.ts'
import { sampleDemoCursor } from './sampleDemoCursor.ts'
import { sampleDemoPlannerPresence } from './sampleDemoPlannerPresence.ts'

export function createDemoPeers(
  state: DemoState,
  now = Date.now(),
): Presence[] {
  const elapsed = Math.max(0, now - Date.parse(state.studio.createdAt))
  const board = state.envelope.workspace.boards.find(
    (item) => item.id === 'layers',
  )
  const page = state.envelope.workspace.design.pages?.[0]
  const noahTargets = (page?.nodes || [])
    .filter((node) => node.kind === 'text' || node.kind === 'button')
    .slice(0, 5)
    .map((node, index) => {
      const position = designPosition(page!.nodes, node)
      return {
        id: node.id,
        x: position.x + 30,
        y: position.y + 12,
        pause: [4200, 6000, 1800, 5100, 2900][index],
        camera: {
          x: position.x + 180,
          y: position.y + 160,
          zoom: [0.8, 1, 0.85, 0.75, 0.95][index],
        },
      }
    })
  const maya = sampleDemoPlannerPresence(state, now)
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
    },
    {
      clientId: 'demo-noah',
      profile: {
        id: 'demo-noah',
        name: 'Noah · demo',
        color: '#359381',
        avatar: '/demo-noah.svg',
      },
      boardId: null,
      view: 'design',
      designPageId: page?.id || null,
      ...noah,
      selectedEdges: [],
      seenAt: now,
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
