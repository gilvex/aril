import assert from 'node:assert/strict'
import { test } from 'node:test'
import { makeDesignElement } from '@pomegranate/domain/design'
import { activeBoardSections } from '@pomegranate/domain/workspace'
import {
  createExampleDesignLibrary,
  designLibrarySchema,
  getDesignUsage,
  designAssetSummaries,
  instantiateDesignComponent,
  createDesignComponent,
} from '@pomegranate/domain/designLibrary'
import { designLibraryGraph } from '../src/widgets/design/utils/designLibraryGraph.ts'

test('usage tracks instance roots once and every bound property and machine reference', () => {
  const library = createExampleDesignLibrary('test')
  const card = createDesignComponent(
    [
      makeDesignElement('group', 'root'),
      makeDesignElement('text', 'child', {
        parentId: 'root',
        bindings: { fontSize: 'fontW' },
      }),
    ],
    ['root'],
    'card',
    'Card',
  )
  library.components.card = card
  library.variables.fontW = {
    id: 'fontW',
    name: 'fontWeight',
    collectionId: 'test-theme',
    type: 'number',
    values: { Light: 16, Dark: 18 },
  }
  const nodes = instantiateDesignComponent(card, 'default', 'instance', {
    x: 20,
    y: 30,
  })
  const pages = [{ id: 'page', name: 'Dashboard', nodes: [...nodes].reverse() }]
  const usage = getDesignUsage({ pages, library })
  const instance = usage.filter(
    (u) => u.assetId === 'card' && u.ownerKind === 'page',
  )
  assert.equal(instance.length, 1)
  assert.equal(instance[0].nodeId, nodes.find((n) => !n.parentId)!.id)
  assert.equal(usage.filter((u) => u.assetId === 'fontW').length, 2)
  assert.equal(
    usage.filter(
      (u) => u.assetId === 'test-accent' && u.ownerKind === 'component',
    ).length,
    2,
  )
  assert.equal(
    usage.filter((u) => u.assetId === 'test-busy' && u.property === 'entry')
      .length,
    3,
  )
  assert.ok(
    usage.some(
      (u) =>
        u.assetId === 'test-busy' &&
        u.transitionId === 'start' &&
        u.property === 'guard',
    ),
  )
  assert.ok(
    usage.some((u) => u.assetId === 'test-button' && u.ownerKind === 'machine'),
  )
  assert.equal(
    designAssetSummaries({ library, pages }).find((a) => a.id === 'fontW')
      ?.usageCount,
    2,
  )
  assert.deepEqual(getDesignUsage({}), [])
})

test('graph search retains immediate usage neighbors without mutating documents', () => {
  const library = createExampleDesignLibrary('test')
  const before = structuredClone(library)
  const graph = designLibraryGraph({
    library,
    pages: [],
    usage: getDesignUsage({ library }),
    libraryQuery: 'PRIMARY',
    libraryKind: 'variable',
    libraryAsset: 'variable:test-accent',
  })
  assert.deepEqual(
    graph.nodes.map((n) => n.id),
    ['variable:test-accent', 'component:test-button'],
  )
  assert.equal(graph.edges.length, 1)
  assert.equal(graph.nodes[0].selected, true)
  assert.equal(graph.nodes[1].style?.opacity, 0.55)
  assert.deepEqual(library, before)
})

test('component icons survive schema parsing and legacy board choices become Design without mutation', () => {
  const library = createExampleDesignLibrary('test')
  library.components['test-button'].icon = '🚀'
  assert.equal(
    designLibrarySchema.parse(library).components['test-button'].icon,
    '🚀',
  )
  library.components['test-button'].icon = 'x'.repeat(13)
  assert.equal(designLibrarySchema.safeParse(library).success, false)
  const board = {
    sections: ['wireframes', 'canvas', 'design'] as (
      'wireframes' | 'canvas' | 'design'
    )[],
  }
  assert.deepEqual(activeBoardSections(board), ['design', 'canvas'])
  assert.deepEqual(board.sections, ['wireframes', 'canvas', 'design'])
})
