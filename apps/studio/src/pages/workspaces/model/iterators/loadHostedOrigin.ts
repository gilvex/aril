import type { SagaIterator } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import { fetchHostedOrigin } from '../requests/fetchHostedOrigin.ts'
import { workspaceHomeSlice } from '../slices/workspaceHomeSlice.ts'
export function* loadHostedOrigin(signal: AbortSignal): SagaIterator {
  try {
    const result: { hostedOrigin?: string } = yield call(
      fetchHostedOrigin,
      signal,
    )
    yield put(
      workspaceHomeSlice.actions.setHostedOrigin(result.hostedOrigin || null),
    )
  } catch {
    /* Optional hosted handoff. */
  }
}
