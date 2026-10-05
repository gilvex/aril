import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  makeWireNode,
  type Wireframe,
  type WireNode,
} from '../domain/wireframe.ts'
import { routeWireframes } from '../src/pages/studio/model/wire-routing.ts'

const link = (
  id: string,
  source: string,
  target: string,
): Wireframe['edges'][number] => ({
  id,
  source,
  target,
  label: 'On click',
  type: 'smoothstep',
})
function avoids(points: { x: number; y: number }[], node: WireNode) {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      r = node.position
    const intersects =
      a.x === b.x
        ? a.x > r.x &&
          a.x < r.x + node.width &&
          Math.max(a.y, b.y) > r.y &&
          Math.min(a.y, b.y) < r.y + node.height
        : a.y > r.y &&
          a.y < r.y + node.height &&
          Math.max(a.x, b.x) > r.x &&
          Math.min(a.x, b.x) < r.x + node.width
    assert.equal(intersects, false, `Route crosses ${node.id}`)
  }
}

test('wireframe forward and return paths go around intervening screens', () => {
  const screens = [0, 900, 1800].map((x, i) =>
    makeWireNode('screen', `screen-${i}`, { x, y: 0 }),
  )
  const action = makeWireNode(
    'button',
    'action',
    { x: 440, y: 350 },
    screens[0].id,
  )
  const returnAction = makeWireNode(
    'button',
    'return',
    { x: 440, y: 350 },
    screens[2].id,
  )
  const edges = [
    link('forward', action.id, screens[2].id),
    link('back', returnAction.id, screens[0].id),
  ]
  const nodes = [...screens, action, returnAction]
  const before = JSON.stringify(nodes)
  const routes = routeWireframes(nodes, edges)
  for (const edge of edges) {
    const route = routes.get(edge.id)!
    assert.ok(route)
    assert.ok(!/NaN|Infinity/.test(route.path))
    avoids(route.points, screens[1])
  }
  assert.equal(
    JSON.stringify(nodes),
    before,
    'Routing must not modify saved layout',
  )
})

test('flows avoid sibling blocks and spread screen arrivals; moving a parent reroutes', () => {
  const screen = makeWireNode('screen', 'screen', { x: 0, y: 0 })
  const target = makeWireNode('screen', 'target', { x: 900, y: 0 })
  const action = makeWireNode('button', 'action', { x: 24, y: 150 }, screen.id)
  const obstacle = makeWireNode(
    'card',
    'obstacle',
    { x: 240, y: 120 },
    screen.id,
  )
  const edges = [
    link('a', action.id, target.id),
    link('b', action.id, target.id),
  ]
  const nodes = [screen, target, action, obstacle]
  const routes = routeWireframes(nodes, edges)
  assert.equal(routes.size, 2)
  avoids(routes.get('a')!.points, obstacle)
  assert.notEqual(
    routes.get('a')!.points.at(-1)!.y,
    routes.get('b')!.points.at(-1)!.y,
  )
  const moved = routeWireframes(
    nodes.map((n) =>
      n.id === screen.id ? { ...n, position: { x: 100, y: 100 } } : n,
    ),
    edges,
  )
  assert.equal(moved.get('a')!.points[0].x, routes.get('a')!.points[0].x + 100)
  assert.equal(moved.get('a')!.points[0].y, routes.get('a')!.points[0].y + 100)
})

test('overlapping terminals fall back without invalid paths or hanging', () => {
  const a = makeWireNode('button', 'a', { x: 0, y: 0 })
  const b = makeWireNode('button', 'b', { x: 0, y: 0 })
  const routes = routeWireframes([a, b], [link('edge', a.id, b.id)])
  const route = routes.get('edge')
  assert.ok(!route || !/NaN|Infinity/.test(route.path))
})
