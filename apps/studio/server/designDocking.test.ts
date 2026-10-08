import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDesignEditorState } from '../src/widgets/design/model/createDesignEditorState.ts'
import { designEditorSlice } from '../src/widgets/design/model/slices/designEditorSlice.ts'
import { designDockLayout } from '../src/widgets/design/utils/designDockLayout.ts'
import { designDockTarget } from '../src/widgets/design/utils/designDockTarget.ts'
import { designPanelPreference } from '../src/widgets/design/utils/designPanelPreference.ts'
import { readDesignPanelLayout } from '../src/widgets/design/utils/readDesignPanelLayout.ts'
const edges = [null, 'left', 'right', 'top', 'bottom'] as const

test('all edge combinations fit the editor and reserve a usable canvas', () => {
  for (const [panelSpace, panelVerticalSpace] of [
    [1280, 800],
    [1100, 500],
    [600, 400],
  ]) {
    for (const layersDocked of edges)
      for (const inspectorDocked of edges)
        for (const dockMode of ['split', 'tabs'] as const) {
          const state = {
            ...createDesignEditorState(),
            panelSpace,
            panelVerticalSpace,
            layers: true,
            inspector: true,
            layersDocked,
            inspectorDocked,
            dockMode,
          }
          const { panels, insets, group } = designDockLayout(state)
          assert.ok(panelSpace - insets.left - insets.right >= 320)
          assert.ok(panelVerticalSpace - insets.top - insets.bottom >= 240)
          for (const rect of Object.values(panels)) {
            assert.ok(
              rect.left >= 0 &&
                rect.top >= 0 &&
                rect.width >= 0 &&
                rect.height >= 0,
            )
            assert.ok(rect.left + rect.width <= panelSpace)
            assert.ok(rect.top + rect.height <= panelVerticalSpace)
          }
          if (layersDocked && inspectorDocked && !group) {
            const a = panels.left,
              b = panels.right
            assert.ok(
              a.left + a.width <= b.left ||
                b.left + b.width <= a.left ||
                a.top + a.height <= b.top ||
                b.top + b.height <= a.top,
            )
          }
        }
  }
})

test('shared edges support split and tabbed panels, and opening a hidden panel activates it', () => {
  let state = {
    ...createDesignEditorState(),
    layers: true,
    inspector: true,
    layersDocked: 'top' as const,
    inspectorDocked: 'top' as const,
  }
  const split = designDockLayout(state)
  assert.equal(split.panels.left.width, state.panelSpace / 2)
  assert.equal(split.panels.right.left, split.panels.left.width)
  state = designEditorSlice.reducer(
    state,
    designEditorSlice.actions.patch({ dockMode: 'tabs', dockActive: 'left' }),
  ) as typeof state
  const tabs = designDockLayout(state)
  assert.ok(tabs.group)
  assert.deepEqual(tabs.panels.left, tabs.panels.right)
  assert.equal(tabs.panels.left.top, 36)
  const selected = designEditorSlice.reducer(
    state,
    designEditorSlice.actions.patch({ selection: ['node'], inspector: true }),
  )
  assert.equal(selected.dockActive, 'left')
  const reopened = designEditorSlice.reducer(
    { ...state, inspector: false },
    designEditorSlice.actions.patch({ inspector: true }),
  )
  assert.equal(reopened.dockActive, 'right')
  assert.equal(designDockLayout({ ...selected, layers: false }).group, null)
})

test('docking targets use the nearest edge and reject the canvas center or outside points', () => {
  assert.equal(designDockTarget(10, 300, 1000, 700), 'left')
  assert.equal(designDockTarget(995, 300, 1000, 700), 'right')
  assert.equal(designDockTarget(500, 5, 1000, 700), 'top')
  assert.equal(designDockTarget(500, 695, 1000, 700), 'bottom')
  assert.equal(designDockTarget(20, 5, 1000, 700), 'top')
  assert.equal(designDockTarget(500, 300, 1000, 700), null)
  assert.equal(designDockTarget(-10, 5, 1000, 700), null)
})

test('stored layouts retain only layout preferences and recover from invalid values', () => {
  const initial = createDesignEditorState()
  const saved = {
    ...initial,
    layersDocked: 'bottom' as const,
    dockMode: 'tabs' as const,
    panelPositions: { left: { x: 750, y: 500 }, right: null },
    layersDockHeight: 250,
  }
  const preference = designPanelPreference(saved)
  assert.deepEqual(
    readDesignPanelLayout(JSON.stringify(preference)),
    preference,
  )
  assert.equal('selection' in preference, false)
  assert.equal('dockPreview' in preference, false)
  assert.equal('compact' in preference, false)
  assert.deepEqual(
    readDesignPanelLayout('{broken'),
    designPanelPreference(initial),
  )
  const restored = readDesignPanelLayout(
    JSON.stringify({
      layersDocked: 'invalid',
      layersWidth: -50,
      inspectorHeight: 'bad',
      panelPositions: { left: { x: 'bad', y: 0 } },
      selection: ['private'],
    }),
  )
  assert.equal(restored.layersDocked, null)
  assert.equal(restored.layersWidth, 220)
  assert.equal(restored.inspectorHeight, 600)
  assert.equal(restored.panelPositions.left, null)
  const floating = designDockLayout({
    ...saved,
    layersDocked: null,
    panelSpace: 700,
    panelVerticalSpace: 450,
  }).panels.left
  assert.ok(
    floating.left + floating.width <= 700 &&
      floating.top + floating.height <= 450,
  )
  assert.equal(saved.layersHeight, 520)
})

test('compact layout keeps desktop docking preferences but gives drawers the full canvas', () => {
  const state = {
    ...createDesignEditorState(),
    compact: true,
    layers: true,
    layersDocked: 'left' as const,
    inspectorDocked: 'bottom' as const,
  }
  assert.deepEqual(designDockLayout(state).insets, {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  })
  assert.equal(state.layersDocked, 'left')
  assert.equal(designDockLayout(state).group, null)
})
