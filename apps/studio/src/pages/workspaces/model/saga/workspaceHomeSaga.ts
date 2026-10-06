import type { SagaIterator } from 'redux-saga'
import { call } from 'redux-saga/effects'
import { loadWorkspaces } from '../iterators/loadWorkspaces.ts'
export function* workspaceHomeSaga(): SagaIterator {
  yield call(loadWorkspaces)
}
