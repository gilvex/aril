import assert from 'node:assert/strict'
import { test } from 'node:test'
import { makeDesignElement } from '@pomegranate/domain/design'
import { alignDesignLayers } from '../src/widgets/design/utils/alignDesignLayers.ts'
import { workspaceTabsSlice } from '../src/pages/studio/model/slices/workspaceTabsSlice.ts'

test('alignment uses canvas bounds across frames and preserves child offsets when moving frames', () => {
  const frame = makeDesignElement('frame', 'frame', {
    x: 200,
    y: 100,
    width: 400,
    height: 300,
  })
  const child = makeDesignElement('rectangle', 'child', {
    parentId: frame.id,
    x: 30,
    y: 20,
    width: 50,
    height: 60,
  })
  const other = makeDesignElement('rectangle', 'other', {
    x: 700,
    y: 400,
    width: 100,
    height: 90,
  })
  const nodes = [frame, child, other]
  const grouped = alignDesignLayers(
    nodes,
    ['frame', 'child', 'other'],
    'x',
    'end',
  )
  assert.equal(grouped[0].x, 400)
  assert.equal(grouped[1].x, 30)
  assert.equal(grouped[2].x, 700)
  const separate = alignDesignLayers(nodes, ['child', 'other'], 'x', 'end')
  assert.equal(separate[1].x, 550)
  assert.equal(separate[2].x, 700)
  assert.equal(nodes[0].x, 200)
  assert.equal(nodes[1].x, 30)
})

test('a single child aligns within its parent while a locked or root-only selection is unchanged', () => {
  const frame = makeDesignElement('frame', 'frame', {
    x: 200,
    y: 100,
    width: 400,
    height: 300,
  })
  const child = makeDesignElement('rectangle', 'child', {
    parentId: frame.id,
    x: 30,
    y: 20,
    width: 50,
    height: 60,
  })
  assert.equal(
    alignDesignLayers([frame, child], ['child'], 'y', 'center')[1].y,
    120,
  )
  assert.equal(
    alignDesignLayers([frame, child], ['child'], 'x', 'start')[1].x,
    0,
  )
  const locked = [frame, { ...child, locked: true }]
  assert.equal(alignDesignLayers(locked, ['child'], 'x', 'end'), locked)
  assert.deepEqual(alignDesignLayers([frame], ['frame'], 'y', 'end'), [frame])
})

test('opening workspaces retains tab order, refreshes metadata, and closing affects only the target tab', () => {
  const { reducer, actions } = workspaceTabsSlice
  const first = {
    id: 'alpha',
    name: 'Alpha',
    role: 'owner' as const,
    createdAt: '2026-10-07',
  }
  const second = { ...first, id: 'beta', name: 'Beta' }
  const opened = reducer(
    reducer(undefined, actions.opened(first)),
    actions.opened(second),
  )
  const updated = reducer(opened, actions.opened({ ...first, name: 'Renamed' }))
  assert.deepEqual(
    updated.tabs.map(({ id, name }) => [id, name]),
    [
      ['alpha', 'Renamed'],
      ['beta', 'Beta'],
    ],
  )
  assert.deepEqual(reducer(updated, actions.closed('alpha')).tabs, [second])
  assert.equal(reducer(updated, actions.closed('missing')).tabs.length, 2)
  assert.equal(opened.tabs[0].name, 'Alpha')
})
