import { loadWorkspaces } from '@/pages/workspaces/model/iterators/loadWorkspaces.ts'
import type { SagaIterator } from 'redux-saga'
import { call } from 'redux-saga/effects'
export function* workspaceHomeSaga(): SagaIterator {
  yield call(loadWorkspaces)
}
