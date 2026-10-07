import test from 'node:test'
import assert from 'node:assert/strict'
import { designEditorSlice } from '../src/widgets/design/model/slices/designEditorSlice.ts'
import { createDesignEditorState } from '../src/widgets/design/model/createDesignEditorState.ts'
import { designPanelLimit } from '../src/widgets/design/utils/designPanelLimit.ts'

test('desktop selection and page picker preserve both design panels; compact mode opens one drawer', () => {
  const patch = designEditorSlice.actions.patch
  let state = designEditorSlice.reducer(
    createDesignEditorState(),
    patch({ layers: true, layersDocked: true, layersWidth: 340 }),
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
  assert.equal(state.layersDocked, true)
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
    layersDocked: true,
    inspectorDocked: true,
  }
  assert.equal(designPanelLimit(state, true), 310)
  assert.equal(state.panelSpace - 2 * designPanelLimit(state, true), 280)
  assert.equal(designPanelLimit(state, false), 480)
  assert.equal(designPanelLimit({ ...state, inspector: false }, true), 480)
})
