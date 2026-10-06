import { takeLeading } from 'redux-saga/effects'
import { endSession } from '../iterators/endSession.ts'
import { accountActionsSlice } from '../slices/accountActionsSlice.ts'

export function* accountActionsSaga(beforeLeave: () => Promise<boolean>) {
  yield takeLeading(
    accountActionsSlice.actions.requested.type,
    endSession,
    beforeLeave,
  )
}
