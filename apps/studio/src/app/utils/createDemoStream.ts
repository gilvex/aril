import type { DemoState } from '../types/demoState.ts'
import { createDemoPeers } from './createDemoPeers.ts'
import { advanceDemoActions } from './advanceDemoActions.ts'
import { advanceDemoPlanner } from './advanceDemoPlanner.ts'
import { applyDemoActionPresence } from './applyDemoActionPresence.ts'

export function createDemoStream(
  state: DemoState,
  signal?: AbortSignal | null,
  storage?: Pick<Storage, 'setItem'>,
) {
  const encoder = new TextEncoder()
  let stop = () => {}
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let ended = false
      let activity = ''
      let presence = ''
      let lastPresence = 0
      let revision = state.envelope.revision
      const tick = () => {
        if (ended) return
        const send = (event: string, data: unknown) =>
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          )
        const now = Date.now()
        if (storage) {
          advanceDemoActions(state, storage, now)
          advanceDemoPlanner(state, storage, now)
        }
        if (revision !== state.envelope.revision) {
          revision = state.envelope.revision
          send('workspace', state.envelope)
        }
        const peers = applyDemoActionPresence(
          createDemoPeers(state, now),
          state,
          now,
        )
        const signature = JSON.stringify(peers, (key, value) =>
          key === 'seenAt' ? undefined : value,
        )
        if (signature !== presence || Date.now() - lastPresence > 5000) {
          presence = signature
          lastPresence = Date.now()
          send('presence', peers)
        }
        const next = JSON.stringify(state.activity)
        if (next !== activity) {
          activity = next
          send('activity', state.activity)
        }
      }
      const timer = setInterval(tick, 40)
      const abort = () => {
        if (!ended) {
          stop()
          controller.close()
        }
      }
      stop = () => {
        ended = true
        clearInterval(timer)
        signal?.removeEventListener('abort', abort)
      }
      if (signal?.aborted) abort()
      else {
        signal?.addEventListener('abort', abort, { once: true })
        tick()
      }
    },
    cancel() {
      stop()
    },
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
