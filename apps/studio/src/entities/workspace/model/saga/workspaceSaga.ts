import { saveAfterEdit } from '@/entities/workspace/model/iterators/saveAfterEdit.ts'
import { workspaceSlice } from '@/entities/workspace/model/slices/workspaceSlice.ts'
import type { SagaIterator } from 'redux-saga'
import { takeLatest } from 'redux-saga/effects'
export function* workspaceSaga(flush: () => Promise<boolean>): SagaIterator {
  yield takeLatest(workspaceSlice.actions.editQueued.type, saveAfterEdit, flush)
}
