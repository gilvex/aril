import { loadHostedOrigin } from '@/pages/workspaces/model/iterators/loadHostedOrigin.ts'
import { loadStudioList } from '@/pages/workspaces/model/iterators/loadStudioList.ts'
import type { SagaIterator } from 'redux-saga'
import { all, call } from 'redux-saga/effects'
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
