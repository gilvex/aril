import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createExampleDesignLibrary,
  designLibrarySchema,
  designAssetSummaries,
  getDesignUsage,
} from '@pomegranate/domain/designLibrary'
import { libraryMapAssets } from '../src/widgets/design/utils/libraryMapAssets.ts'
import { libraryMapGraph } from '../src/widgets/design/utils/libraryMapGraph.ts'
import { libraryMapNeighborhood } from '../src/widgets/design/utils/libraryMapNeighborhood.ts'
import { libraryIndirectUsage } from '../src/widgets/design/utils/libraryIndirectUsage.ts'
import type { LibraryMapInput } from '../src/widgets/design/types/libraryMapInput.ts'

test('large library organization survives parsing and cluster navigation never drops search results', () => {
  const library = createExampleDesignLibrary('large')
  for (let i = 0; i < 2480; i++)
    library.variables[`v${i}`] = {
      id: `v${i}`,
      name: `fontW/${i}`,
      collectionId: 'large-theme',
      type: 'number',
      values: { Light: 16, Dark: 18 },
      organization: {
        library: `Library ${i % 6}`,
        family: `Family ${Math.floor(i / 6) % 4}`,
      },
    }
  for (let i = 0; i < 120; i++)
    library.components[`c${i}`] = {
      ...library.components['large-button'],
      id: `c${i}`,
      name: `Button ${i}`,
    }
  const parsed = designLibrarySchema.parse(library)
  assert.equal(Object.keys(parsed.variables).length, 2482)
  assert.deepEqual(parsed.variables.v0.organization, {
    library: 'Library 0',
    family: 'Family 0',
  })
  const summaries = designAssetSummaries({ library: parsed })
  assert.equal(
    summaries.find((a) => a.id === 'v0')?.organization.library,
    'Library 0',
  )
  const before = structuredClone(parsed)
  const assets = libraryMapAssets({
    library: parsed,
    pages: [],
    usage: getDesignUsage({ library: parsed }),
  })
  const input: LibraryMapInput = {
    assets,
    edges: [],
    path: [],
    query: '',
    kind: 'all',
    usage: 'all',
    selected: null,
    focus: false,
    depth: 1,
    direction: 'both',
    offset: 0,
  }
  const overview = libraryMapGraph(input)
  assert.equal(overview.nodes.length, 8)
  assert.equal(
    overview.nodes.reduce((sum, n) => sum + n.data.count, 0),
    assets.length,
  )
  const families = libraryMapGraph({ ...input, path: ['Library 0'] })
  assert.equal(families.nodes.length, 4)
  const leaf = libraryMapGraph({ ...input, path: ['Library 0', 'Family 0'] })
  assert.equal(leaf.nodes.length, 24)
  assert.ok(leaf.total > 60)
  const second = libraryMapGraph({
    ...input,
    path: ['Library 0', 'Family 0'],
    offset: 24,
  })
  assert.ok(second.nodes.every((n) => !leaf.nodes.some((a) => a.id === n.id)))
  const exact = libraryMapGraph({ ...input, query: 'fontW/2479' })
  assert.equal(exact.nodes.length, 1)
  assert.equal(exact.nodes[0].id, 'variable:v2479')
  const allMatches = libraryMapGraph({ ...input, query: 'fontW' })
  assert.equal(allMatches.total, 2480)
  assert.equal(allMatches.nodes.length, 24)
  assert.deepEqual(libraryMapGraph(input), overview)
  assert.deepEqual(parsed, before)
})

test('map groups real links, preserves positions on focus, and bounds crowded external libraries', () => {
  const library = createExampleDesignLibrary('map')
  const usage = getDesignUsage({ library })
  const assets = libraryMapAssets({ library, pages: [], usage })
  const edges = usage.map((u, i) => ({
    id: String(i),
    source: `${u.assetKind}:${u.assetId}`,
    target: `${u.ownerKind}:${u.ownerId}`,
  }))
  const input: LibraryMapInput = {
    assets,
    edges,
    path: [],
    query: '',
    kind: 'all',
    usage: 'all',
    selected: null,
    focus: false,
    depth: 1,
    direction: 'both',
    offset: 0,
    individual: true,
  }
  const normal = libraryMapGraph(input)
  const focused = libraryMapGraph({
    ...input,
    selected: 'component:map-button',
  })
  assert.equal(
    focused.nodes.find((n) => n.id === 'variable:map-busy')?.style?.opacity,
    0.1,
  )
  for (const node of focused.nodes)
    assert.deepEqual(
      node.position,
      normal.nodes.find((n) => n.id === node.id)?.position,
    )
  const uses = libraryMapGraph({
    ...input,
    selected: 'component:map-button',
    focus: true,
    direction: 'uses',
  })
  assert.deepEqual(
    uses.assets.map((a) => a.id),
    ['component:map-button', 'variable:map-accent'],
  )
  assert.ok(
    uses.edges.every(
      (e) =>
        uses.nodes.some((n) => n.id === e.source) &&
        uses.nodes.some((n) => n.id === e.target),
    ),
  )
  assert.ok(
    libraryMapGraph({ ...input, selected: 'deleted', focus: true }).nodes.every(
      (n) => n.style?.opacity === 1,
    ),
  )
  const used = libraryMapGraph({ ...input, usage: 'used' })
  assert.ok(used.assets.every((a) => a.count > 0))
  assert.equal(libraryMapGraph({ ...input, query: 'no-match' }).nodes.length, 0)
})

test('dependency traversal handles cycles and distinguishes direct from indirect usages', () => {
  const edges = [
    { id: 'ab', source: 'a', target: 'b' },
    { id: 'bc', source: 'b', target: 'c' },
    { id: 'ca', source: 'c', target: 'a' },
  ]
  assert.deepEqual(
    [...libraryMapNeighborhood(edges, 'a', 1, 'usedBy')],
    ['a', 'b'],
  )
  assert.deepEqual(
    [...libraryMapNeighborhood(edges, 'a', 2, 'usedBy')],
    ['a', 'b', 'c'],
  )
  assert.deepEqual(
    [...libraryMapNeighborhood(edges, 'a', 1, 'uses')],
    ['a', 'c'],
  )
  const indirect = libraryIndirectUsage(
    [
      {
        assetKind: 'variable',
        assetId: 'v',
        ownerKind: 'component',
        ownerId: 'c',
        ownerName: 'Button',
      },
      {
        assetKind: 'component',
        assetId: 'c',
        ownerKind: 'page',
        ownerId: 'p',
        ownerName: 'Page',
      },
    ],
    'variable:v',
  )
  assert.deepEqual(indirect, [{ id: 'page:p', name: 'Page' }])
})

test('compact graph routes outside nodes and focus reads dependencies to usages', async () => {
  const { libraryEdgePath } =
    await import('../src/widgets/design/utils/libraryEdgePath.ts')
  const { libraryMapLayout } =
    await import('../src/widgets/design/utils/libraryMapLayout.ts')
  const path = libraryEdgePath(
    { x: 0, y: 0, width: 180, height: 110 },
    { x: 300, y: 0, width: 180, height: 110 },
  )
  assert.match(path, /^M188,55 Q/)
  assert.ok(path.endsWith('292,55'))
  assert.equal(
    libraryEdgePath(
      { x: 0, y: 0, width: 180, height: 110 },
      { x: 0, y: 0, width: 180, height: 110 },
    ),
    '',
  )
  const library = createExampleDesignLibrary('layout')
  const assets = libraryMapAssets({
    library,
    pages: [],
    usage: getDesignUsage({ library }),
  })
  assert.ok(assets.every((a) => a.kind !== 'machine'))
  assert.equal(assets.find((a) => a.assetId === 'layout-busy')?.count, 0)
  const graph = libraryMapGraph({
    assets,
    edges: [],
    path: [],
    query: '',
    kind: 'all',
    usage: 'all',
    selected: null,
    focus: false,
    depth: 1,
    direction: 'both',
    offset: 0,
    individual: true,
  })
  const [a, b, c] = graph.nodes
  const layout = libraryMapLayout(
    [a, b, c],
    [
      { id: 'ab', source: a.id, target: b.id },
      { id: 'bc', source: b.id, target: c.id },
    ],
    b.id,
  )
  assert.ok(layout[0].position.x < layout[1].position.x)
  assert.ok(layout[1].position.x < layout[2].position.x)
})

test('automatic icons follow geometry and exclude descendants of hidden ancestors', async () => {
  const { componentGlyph } =
    await import('../src/widgets/design/utils/componentGlyph.ts')
  const { makeDesignElement } = await import('@pomegranate/domain/design')
  const component =
    createExampleDesignLibrary('glyph').components['glyph-button']
  component.variants = {
    idle: {
      id: 'idle',
      name: 'Default',
      nodes: [
        makeDesignElement('frame', 'root', { width: 200, height: 100 }),
        makeDesignElement('group', 'hidden', {
          parentId: 'root',
          hidden: true,
        }),
        makeDesignElement('group', 'nested', { parentId: 'hidden' }),
        makeDesignElement('text', 'text', { parentId: 'nested' }),
        makeDesignElement('ellipse', 'circle', {
          parentId: 'root',
          x: 10,
          y: 10,
          width: 50,
          height: 50,
        }),
      ],
    },
  }
  const glyph = componentGlyph(component)
  assert.equal(glyph.length, 2)
  assert.equal(glyph[0].width, 24)
  assert.equal(glyph[1].kind, 'ellipse')
  assert.equal(glyph[1].width, 6)
})

test('retired machines survive active edits but cannot be added or changed via MCP', async () => {
  const { rejectRetiredMachineChanges } =
    await import('../../../packages/mcp/src/utils/rejectRetiredMachineChanges.ts')
  const library = createExampleDesignLibrary('archive')
  const before = JSON.parse(JSON.stringify(library))
  delete library.components['archive-button']
  delete library.variables['archive-busy']
  assert.ok(designLibrarySchema.safeParse(library).success)
  assert.deepEqual(library.machines, before.machines)
  assert.doesNotThrow(() =>
    rejectRetiredMachineChanges([
      {
        path: ['design', 'library'],
        before,
        after: JSON.parse(JSON.stringify(library)),
      },
    ]),
  )
  assert.throws(
    () =>
      rejectRetiredMachineChanges([
        { path: ['design', 'library'], after: before },
      ]),
    /retired/,
  )
  assert.throws(
    () =>
      rejectRetiredMachineChanges([
        {
          path: ['boards', 'b', 'design', 'library', 'machines', 'm', 'name'],
          before: 'A',
          after: 'B',
        },
      ]),
    /retired/,
  )
  assert.doesNotThrow(() =>
    rejectRetiredMachineChanges([
      { path: ['design', 'library', 'machines'], after: {} },
    ]),
  )
  assert.doesNotThrow(() =>
    rejectRetiredMachineChanges([
      {
        path: ['boards', 'b', 'nodes', 'machines'],
        after: { name: 'Machine room' },
      },
    ]),
  )
})

test('inline expansion preserves context, reveals exact neighbors, and collapses without moving base nodes', () => {
  const library = createExampleDesignLibrary('inline')
  const usage = getDesignUsage({ library }).filter(
    (u) => u.ownerKind !== 'machine',
  )
  const assets = libraryMapAssets({ library, pages: [], usage })
  const edges = usage.map((u, i) => ({
    id: String(i),
    source: u.assetKind + ':' + u.assetId,
    target: u.ownerKind + ':' + u.ownerId,
  }))
  const input: LibraryMapInput = {
    assets,
    edges,
    path: [],
    query: 'Deploy',
    kind: 'all',
    usage: 'all',
    selected: null,
    focus: false,
    depth: 1,
    direction: 'both',
    offset: 0,
  }
  const base = libraryMapGraph(input)
  const group = base.nodes.find((n) => n.data.external)!
  const positions = Object.fromEntries(
    base.nodes.map((n) => [
      n.id,
      { x: n.position.x + 80, y: n.position.y + 50 },
    ]),
  )
  const open = libraryMapGraph({
    ...input,
    expanded: { [group.id]: 12 },
    positions,
  })
  assert.equal(open.scopeKey, base.scopeKey)
  for (const node of base.nodes)
    assert.deepEqual(
      open.nodes.find((n) => n.id === node.id)?.position,
      positions[node.id],
    )
  assert.ok(open.nodes.some((n) => n.id === 'variable:inline-accent'))
  assert.ok(!open.nodes.some((n) => n.id === 'variable:inline-busy'))
  assert.ok(
    open.edges.some(
      (e) =>
        e.source === 'variable:inline-accent' &&
        e.target === 'component:inline-button',
    ),
  )
  assert.ok(open.nodes.find((n) => n.id === group.id)?.data.expanded)
  assert.equal(new Set(open.nodes.map((n) => n.id)).size, open.nodes.length)
  for (const edge of open.edges)
    assert.ok(
      open.nodes.some((n) => n.id === edge.source) &&
        open.nodes.some((n) => n.id === edge.target),
    )
  const close = libraryMapGraph({ ...input, expanded: {} })
  assert.deepEqual(close.nodes, base.nodes)
  assert.deepEqual(close.edges, base.edges)
})

test('large inline groups reveal twelve assets per batch without losing earlier positions', () => {
  const library = createExampleDesignLibrary('expand')
  for (let i = 0; i < 1000; i++)
    library.variables['v' + i] = {
      id: 'v' + i,
      name: 'Token ' + i,
      collectionId: 'expand-theme',
      type: 'number',
      values: { Light: 1, Dark: 2 },
    }
  const assets = libraryMapAssets({ library, pages: [], usage: [] })
  const input: LibraryMapInput = {
    assets,
    edges: [],
    path: [],
    query: '',
    kind: 'all',
    usage: 'all',
    selected: null,
    focus: false,
    depth: 1,
    direction: 'both',
    offset: 0,
  }
  const base = libraryMapGraph(input),
    group = base.nodes.find((n) => n.data.label === 'Foundations')!
  const first = libraryMapGraph({ ...input, expanded: { [group.id]: 12 } })
  assert.equal(first.nodes.length, base.nodes.length + 13)
  const positions = Object.fromEntries(
    first.nodes.map((n) => [n.id, n.position]),
  )
  const more = libraryMapGraph({
    ...input,
    expanded: { [group.id]: 24 },
    positions,
  })
  assert.equal(more.nodes.length, base.nodes.length + 25)
  for (const node of first.nodes.filter((n) => n.data.kind !== 'more'))
    assert.deepEqual(
      more.nodes.find((n) => n.id === node.id)?.position,
      node.position,
    )
  for (let i = 0; i < more.nodes.length; i++)
    for (let j = i + 1; j < more.nodes.length; j++) {
      const a = more.nodes[i].position,
        b = more.nodes[j].position
      assert.ok(Math.abs(a.x - b.x) >= 220 || Math.abs(a.y - b.y) >= 150)
    }
})
