import { call, put, select } from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import { request } from '@/shared/api/request.ts'
import { invitationSlice } from '../slices/invitationSlice.ts'
export function* submitInvitationRequest<T>(
  url: string,
  init?: RequestInit,
): SagaIterator<T | undefined> {
  if (yield select((state: { busy: boolean }) => state.busy)) return undefined
  yield put(
    invitationSlice.actions.changed({ busy: true, error: '', message: '' }),
  )
  try {
    return yield call(request<T>, url, init)
  } catch (error) {
    yield put(
      invitationSlice.actions.changed({
        error: error instanceof Error ? error.message : 'Something went wrong.',
      }),
    )
    return undefined
  } finally {
    yield put(invitationSlice.actions.changed({ busy: false }))
  }
}
