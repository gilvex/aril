import { fetchHostedOrigin } from '@/pages/workspaces/model/requests/fetchHostedOrigin.ts'
import { workspaceHomeSlice } from '@/pages/workspaces/model/slices/workspaceHomeSlice.ts'
import type { SagaIterator } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
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
