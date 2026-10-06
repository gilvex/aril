import type { SagaIterator } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import { request } from '@/shared/api/request.ts'
import { ApiError } from '@/shared/api/apiError.ts'
import { accountActionsSlice } from '../slices/accountActionsSlice.ts'
import { logoutSession } from '../requests/logoutSession.ts'

export function* endSession(
  beforeLeave: () => Promise<boolean>,
  action: ReturnType<typeof accountActionsSlice.actions.requested>,
): SagaIterator {
  const { mode, confirmed } = action.payload
  yield put(accountActionsSlice.actions.started())
  try {
    if (!confirmed) {
      let linked = false
      try {
        const account: { google: { email: string } | null } = yield call(
          request,
          '/api/account',
        )
        linked = !!account.google
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) throw error
        linked = true
      }
      if (!linked) {
        yield put(accountActionsSlice.actions.confirm(mode))
        return
      }
    }
    const saved: boolean = yield call(beforeLeave)
    if (!saved)
      throw new Error('Save your pending changes before leaving this account.')
    yield call(logoutSession, mode)
  } catch (error) {
    yield put(
      accountActionsSlice.actions.failed(
        error instanceof Error
          ? error.message
          : 'Could not sign out. Please try again.',
      ),
    )
  }
}
