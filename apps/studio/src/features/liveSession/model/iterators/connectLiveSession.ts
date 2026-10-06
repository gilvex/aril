import type { SagaIterator } from 'redux-saga'
import { eventChannel } from 'redux-saga'
import { call, delay, take } from 'redux-saga/effects'
import type { LiveConnectionOptions } from '../../types/liveConnectionOptions.ts'
import { openLiveChannel } from '../requests/openLiveChannel.ts'
export function* connectLiveSession(
  options: LiveConnectionOptions,
): SagaIterator {
  const controller = new AbortController()
  let session: Awaited<ReturnType<typeof openLiveChannel>> = null
  const lifetime = eventChannel<never>(() => () => {})
  try {
    while (!controller.signal.aborted) {
      try {
        session = yield call(
          openLiveChannel,
          options.workspaceId,
          options.clientId,
          options.read,
          options.peers,
          options.connected,
          controller.signal,
        )
        options.ready(session)
        break
      } catch {
        yield delay(5000)
      }
    }
    yield take(lifetime)
  } finally {
    controller.abort()
    session?.close()
    lifetime.close()
  }
}
