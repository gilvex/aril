import { fetchStudios } from '@/pages/workspaces/model/requests/fetchStudios.ts'
import { workspaceHomeSlice } from '@/pages/workspaces/model/slices/workspaceHomeSlice.ts'
import type { StudioOverview } from '@pomegranate/domain/studios'
import type { SagaIterator } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
export function* loadStudioList(signal: AbortSignal): SagaIterator {
  try {
    yield put(workspaceHomeSlice.actions.setError(''))
    const studios: StudioOverview[] = yield call(fetchStudios, signal)
    yield put(workspaceHomeSlice.actions.setStudios(studios))
  } catch (error) {
    yield put(workspaceHomeSlice.actions.setError(String(error)))
  }
}
