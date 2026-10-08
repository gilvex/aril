import { buffers, eventChannel, type SagaIterator } from 'redux-saga'
import { delay, take } from 'redux-saga/effects'
import { isLiveFieldOperation } from '@pomegranate/domain/liveSession'
import { liveFieldsMessageSchema } from '@pomegranate/domain/liveSession'
import type { LiveWorkspaceFieldsOptions } from '../../types/liveWorkspaceFieldsOptions.ts'
export function* shareWorkspaceFields(
  options: LiveWorkspaceFieldsOptions,
): SagaIterator {
  const {
    channel,
    clientId,
    canEdit,
    receiveFields,
    pruneFields,
    pendingFields,
    subscribeFields,
  } = options
  const events = eventChannel<boolean>((emit) => {
    const unsubscribe = subscribeFields(() => emit(false))
    const stop = channel.subscribe((message) => {
      if (message.kind === 'fields' && message.id !== clientId)
        receiveFields(message)
    })
    const heartbeat = setInterval(() => {
      pruneFields()
      emit(true)
    }, 2000)
    const initial = setTimeout(() => emit(true), 0)
    return () => {
      unsubscribe()
      stop()
      clearInterval(heartbeat)
      clearTimeout(initial)
    }
  }, buffers.sliding(1))
  let last = '',
    sequence = Date.now()
  pruneFields()
  try {
    while (true) {
      const force: boolean = yield take(events)
      yield delay(100)
      if (!canEdit) continue
      const operations = pendingFields()
        .filter(isLiveFieldOperation)
        .slice(0, 300)
      const serialized = JSON.stringify(operations)
      if (!force && serialized === last) continue
      last = serialized
      const message = liveFieldsMessageSchema.safeParse({
        kind: 'fields',
        id: clientId,
        sequence: ++sequence,
        operations,
      })
      if (message.success) channel.send(message.data)
    }
  } finally {
    events.close()
  }
}
