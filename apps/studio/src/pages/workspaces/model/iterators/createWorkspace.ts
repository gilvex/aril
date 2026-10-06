import type { StudioSummary } from '@pomegranate/domain/studios'
import type { SagaIterator } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import { requestWorkspaceCreation } from '../requests/requestWorkspaceCreation.ts'
import { workspaceHomeSlice } from '../slices/workspaceHomeSlice.ts'
export function* createWorkspace(
  name: string,
): SagaIterator<StudioSummary | undefined> {
  yield put(workspaceHomeSlice.actions.setBusy(true))
  yield put(workspaceHomeSlice.actions.setError(''))
  try {
    return yield call(requestWorkspaceCreation, name)
  } catch (error) {
    yield put(
      workspaceHomeSlice.actions.setError(
        error instanceof Error ? error.message : 'Could not create workspace.',
      ),
    )
  } finally {
    yield put(workspaceHomeSlice.actions.setBusy(false))
  }
}
