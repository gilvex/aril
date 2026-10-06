import { requestWorkspaceCreation } from '@/pages/workspaces/model/requests/requestWorkspaceCreation.ts'
import { workspaceHomeSlice } from '@/pages/workspaces/model/slices/workspaceHomeSlice.ts'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { SagaIterator } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
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
