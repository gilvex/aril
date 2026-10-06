import type { SagaIterator } from 'redux-saga'
import { takeLatest } from 'redux-saga/effects'
import { saveAfterEdit } from '../iterators/saveAfterEdit.ts'
import { workspaceSlice } from '../slices/workspaceSlice.ts'
export function* workspaceSaga(flush: () => Promise<boolean>): SagaIterator {
  yield takeLatest(workspaceSlice.actions.editQueued.type, saveAfterEdit, flush)
}
