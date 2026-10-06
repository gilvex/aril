import { requestHostedAccess } from '@/pages/workspaces/model/requests/requestHostedAccess.ts'
import { workspaceHomeSlice } from '@/pages/workspaces/model/slices/workspaceHomeSlice.ts'
import type { SagaIterator } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
export function* openHostedWorkspace(): SagaIterator {
  yield put(workspaceHomeSlice.actions.setBusy(true))
  yield put(workspaceHomeSlice.actions.setError(''))
  try {
    const result: { url: string } = yield call(requestHostedAccess)
    location.assign(result.url)
  } catch (error) {
    yield put(
      workspaceHomeSlice.actions.setError(
        error instanceof Error
          ? error.message
          : 'Could not open hosted studio.',
      ),
    )
    yield put(workspaceHomeSlice.actions.setBusy(false))
  }
}
