import type { Presence } from '@pomegranate/domain/collaboration'
import type { DemoState } from '../types/demoState.ts'

export function createDemoPeers(
  state: DemoState,
  now = Date.now(),
): Presence[] {
  const { presence, envelope } = state
  const board =
    envelope.workspace.boards.find((item) => item.id === presence.boardId) ||
    envelope.workspace.boards[0]
  const wire = presence.view === 'wireframes'
  const nodes = wire
    ? board.wireframe?.nodes.filter((node) => !node.parentId) || []
    : board.nodes
  const phase = now / 1600
  const node = nodes[wire ? 0 : 1] || nodes[0]
  const x = (node?.position.x || 0) + 120
  const y = (node?.position.y || 0) + 90
  return [
    {
      clientId: 'demo-maya',
      profile: {
        id: 'demo-maya',
        name: 'Maya · demo',
        color: '#7e64ba',
        avatar: '/demo-maya.svg',
      },
      boardId: board.id,
      view: presence.view || 'canvas',
      cursor: {
        x: x + Math.sin(phase) * 95,
        y: y + Math.cos(phase * 0.7) * 55,
      },
      selected: node ? [node.id] : [],
      selectedEdges: [],
      seenAt: now,
      camera: {
        x: x + Math.sin(phase * 0.2) * 160,
        y,
        zoom: wire ? 0.85 : 0.9,
      },
      requirement:
        presence.view === 'requirements'
          ? {
              id: presence.requirement?.id || 'R13',
              field: 'acceptance',
              typing: true,
            }
          : null,
    },
    {
      clientId: 'demo-noah',
      profile: {
        id: 'demo-noah',
        name: 'Noah · demo',
        color: '#359381',
        avatar: '/demo-noah.svg',
      },
      boardId: board.id,
      view: presence.view || 'canvas',
      cursor: {
        x: x + 340 + Math.cos(phase * 0.8) * 90,
        y: y + 180 + Math.sin(phase) * 50,
      },
      selected: [],
      selectedEdges:
        (wire ? board.wireframe?.edges : board.edges)
          ?.slice(0, 1)
          .map((edge) => edge.id) || [],
      seenAt: now,
      camera: { x: x + 340, y: y + 180, zoom: wire ? 0.7 : 0.8 },
    },
  ]
}
