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
  assert.equal(overview.nodes.length, 9)
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
