import { call, delay, put } from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import type { StudioSummary } from '@pomegranate/domain/studios'
import { request, ApiError, workspaceHeaders } from '@/shared/api/index.ts'
import { settingsSlice } from '../slices/settingsSlice.ts'
export function* watchWorkspaceAccess(workspaceId: string): SagaIterator {
  while (true) {
    try {
      const result: { role: StudioSummary['role'] } = yield call(
        request,
        '/api/workspace-access',
        { headers: workspaceHeaders(workspaceId) },
      )
      yield put(settingsSlice.actions.changed({ role: result.role }))
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        yield put(settingsSlice.actions.changed({ role: null }))
        return
      }
    }
    yield delay(15000)
  }
}
