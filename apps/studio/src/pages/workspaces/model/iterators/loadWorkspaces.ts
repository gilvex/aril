import type { SagaIterator } from 'redux-saga'
import { all, call } from 'redux-saga/effects'
import { loadHostedOrigin } from './loadHostedOrigin.ts'
import { loadStudioList } from './loadStudioList.ts'
export function* loadWorkspaces(): SagaIterator {
  const controller = new AbortController()
  try {
    yield all([
      call(loadHostedOrigin, controller.signal),
      call(loadStudioList, controller.signal),
    ])
  } finally {
    controller.abort()
  }
}
