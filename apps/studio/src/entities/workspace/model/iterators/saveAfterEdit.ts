import type { SagaIterator } from 'redux-saga'
import { call, delay } from 'redux-saga/effects'
export function* saveAfterEdit(flush: () => Promise<boolean>): SagaIterator {
  yield delay(250)
  yield call(flush)
}
