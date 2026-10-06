import type { StudioSummary } from '@pomegranate/domain/studios'
import type { SagaIterator } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import { fetchStudios } from '../requests/fetchStudios.ts'
import { workspaceHomeSlice } from '../slices/workspaceHomeSlice.ts'
export function* loadStudioList(signal: AbortSignal): SagaIterator {
  try {
    const studios: StudioSummary[] = yield call(fetchStudios, signal)
    yield put(workspaceHomeSlice.actions.setStudios(studios))
  } catch (error) {
    yield put(workspaceHomeSlice.actions.setError(String(error)))
  }
}
