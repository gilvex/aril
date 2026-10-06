import type { DemoState } from '../types/demoState.ts'
import { createDemoPeers } from './createDemoPeers.ts'

export function createDemoStream(
  state: DemoState,
  signal?: AbortSignal | null,
) {
  const encoder = new TextEncoder()
  let stop = () => {}
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let ended = false
      let activity = ''
      const tick = () => {
        if (ended) return
        const send = (event: string, data: unknown) =>
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          )
        send('presence', createDemoPeers(state))
        const next = JSON.stringify(state.activity)
        if (next !== activity) {
          activity = next
          send('activity', state.activity)
        }
      }
      const timer = setInterval(tick, 160)
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
