import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createExampleDesignLibrary,
  type DesignUsage,
} from '@pomegranate/domain/designLibrary'
import { libraryUsageResults } from '../src/widgets/design/utils/libraryUsageResults.ts'
import { createDesignEditorState } from '../src/widgets/design/model/createDesignEditorState.ts'
import { designEditorSlice } from '../src/widgets/design/model/slices/designEditorSlice.ts'

test('asset usage search finds layer, property, owner and variant names while keeping direct and indirect uses separate', () => {
  const library = createExampleDesignLibrary('test')
  const usage: DesignUsage[] = [
    {
      assetKind: 'variable',
      assetId: 'test-accent',
      ownerKind: 'component',
      ownerId: 'test-button',
      ownerName: 'Primary action',
      variantId: 'idle',
      nodeName: 'Button background',
      property: 'fill',
    },
    {
      assetKind: 'variable',
      assetId: 'test-accent',
      ownerKind: 'component',
      ownerId: 'test-button',
      ownerName: 'Primary action',
      variantId: 'loading',
      nodeName: 'Loading background',
      property: 'fill',
    },
    {
      assetKind: 'component',
      assetId: 'test-button',
      ownerKind: 'page',
      ownerId: 'checkout',
      ownerName: 'Checkout',
      nodeName: 'Pay now',
    },
    {
      assetKind: 'variable',
      assetId: 'test-accent',
      ownerKind: 'machine',
      ownerId: 'old',
      ownerName: 'Retired',
    },
  ]
  const all = libraryUsageResults(usage, library, 'variable:test-accent', '')
  assert.equal(all.totalUses, 2)
  assert.equal(all.groups.length, 1)
  assert.deepEqual(all.indirect, [{ id: 'page:checkout', name: 'Checkout' }])
  for (const query of ['background', 'fill', 'PRIMARY'])
    assert.equal(
      libraryUsageResults(usage, library, 'variable:test-accent', query)
        .groups[0][1].length,
      2,
    )
  assert.equal(
    libraryUsageResults(usage, library, 'variable:test-accent', 'default')
      .groups[0][1].length,
    1,
  )
  assert.equal(
    libraryUsageResults(usage, library, 'variable:test-accent', 'missing')
      .groups.length,
    0,
  )
  assert.equal(
    libraryUsageResults(usage, library, 'component:test-button', 'color/action')
      .dependencies[0].count,
    2,
  )
  assert.equal(
    libraryUsageResults(usage, library, 'variable:test-accent', 'check')
      .indirect.length,
    1,
  )
})

test('switching assets clears stale searches and previews; inspector navigation keeps its explicit history without changing the map', () => {
  const initial = {
    ...createDesignEditorState(),
    libraryAsset: 'component:first',
    libraryUsageQuery: 'old query',
    libraryPreviewVariant: 'old variant',
    libraryAssetHistory: ['page:old'],
    libraryFocus: false,
  }
  const inspect = designEditorSlice.reducer(
    initial,
    designEditorSlice.actions.patch({
      libraryAsset: 'variable:next',
      libraryAssetHistory: ['component:first'],
    }),
  )
  assert.deepEqual(inspect.libraryAssetHistory, ['component:first'])
  assert.equal(inspect.libraryUsageQuery, '')
  assert.equal(inspect.libraryPreviewVariant, '')
  assert.equal(inspect.libraryFocus, false)
  const external = designEditorSlice.reducer(
    inspect,
    designEditorSlice.actions.patch({ libraryAsset: 'page:other' }),
  )
  assert.deepEqual(external.libraryAssetHistory, [])
  assert.equal(external.libraryInspectorView, 'details')
})
