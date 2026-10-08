import test from 'node:test'
import assert from 'node:assert/strict'
import { designEditorSlice } from '../src/widgets/design/model/slices/designEditorSlice.ts'
import { createDesignEditorState } from '../src/widgets/design/model/createDesignEditorState.ts'
import { designDockLayout } from '../src/widgets/design/utils/designDockLayout.ts'
import { designMobileToolPatch } from '../src/widgets/design/utils/designMobileToolPatch.ts'

test('mobile tools share one sheet, retain selection, and remember the last tab', () => {
  const patch = designEditorSlice.actions.patch
  let state = designEditorSlice.reducer(
    createDesignEditorState(),
    patch({ compact: true }),
  )
  for (const tab of ['layers', 'library', 'properties'] as const) {
    state = designEditorSlice.reducer(state, patch(designMobileToolPatch(tab)))
    assert.equal(state.mobileToolsTab, tab)
    assert.equal(state.layers, tab !== 'properties')
    assert.equal(state.inspector, tab === 'properties')
    assert.equal(state.pagesOpen, false)
    state = designEditorSlice.reducer(state, patch({ selection: ['frame'] }))
    assert.equal(state.layers || state.inspector, true)
    state = designEditorSlice.reducer(
      state,
      patch({ layers: false, inspector: false }),
    )
    assert.equal(state.mobileToolsTab, tab)
    state = designEditorSlice.reducer(
      state,
      patch(designMobileToolPatch(state.mobileToolsTab)),
    )
    assert.equal(state.mobileToolsTab, tab)
    assert.deepEqual(state.selection, ['frame'])
  }
  state = designEditorSlice.reducer(state, patch({ pagesOpen: true }))
  assert.equal(state.layers || state.inspector, false)
  assert.equal(state.pagesOpen, true)
})

test('desktop selection and page picker preserve both design panels; compact mode opens one drawer', () => {
  const patch = designEditorSlice.actions.patch
  let state = designEditorSlice.reducer(
    createDesignEditorState(),
    patch({ layers: true, layersDocked: 'left' as const, layersWidth: 340 }),
  )
  state = designEditorSlice.reducer(
    state,
    patch({ selection: ['frame'], inspector: true }),
  )
  assert.equal(state.layers, true)
  assert.equal(state.inspector, true)
  state = designEditorSlice.reducer(state, patch({ pagesOpen: true }))
  assert.equal(state.layers, true)
  assert.equal(state.inspector, true)
  state = designEditorSlice.reducer(state, patch({ compact: true }))
  assert.equal(state.pagesOpen, true)
  assert.equal(state.layers, false)
  assert.equal(state.inspector, false)
  state = designEditorSlice.reducer(state, patch({ layers: true }))
  state = designEditorSlice.reducer(
    state,
    patch({ selection: ['text'], inspector: false }),
  )
  assert.equal(state.layers, true)
  assert.equal(state.pagesOpen, false)
  assert.equal(state.layersDocked, 'left')
  assert.equal(state.layersWidth, 340)
  state = designEditorSlice.reducer(state, patch({ inspector: true }))
  assert.equal(state.layers, false)
  assert.equal(state.inspector, true)
})

test('docked panel limits leave room for the canvas while floating panels can expand', () => {
  const state = {
    ...createDesignEditorState(),
    panelSpace: 900,
    layers: true,
    inspector: true,
    layersDocked: 'left' as const,
    inspectorDocked: 'right' as const,
  }
  assert.equal(designDockLayout(state).insets.left, 280)
  assert.equal(designDockLayout(state).insets.right, 290)
  assert.equal(
    designDockLayout({ ...state, layersDocked: null }).panels.left.width,
    280,
  )
  assert.equal(designDockLayout({ ...state, inspector: false }).insets.right, 0)
})
