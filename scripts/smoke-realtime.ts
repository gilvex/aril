// Uses random test-only room names and profiles; never writes planning data.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { RealtimeClient } from '@supabase/realtime-js'
import { createLiveSession } from '../server/live-session.ts'
import {
  encode64,
  publicKey,
  signMessage,
  verifyMessage,
  verifyCertificate,
} from '../domain/live-session.ts'

const room = 'smoke-' + randomUUID()
const keys = await crypto.subtle.generateKey('Ed25519', true, [
  'sign',
  'verify',
])
const clientId = randomUUID()
const config = createLiveSession(
  room,
  { id: randomUUID(), name: 'Realtime smoke', avatar: '', color: '#b34568' },
  clientId,
  encode64(await crypto.subtle.exportKey('raw', keys.publicKey)),
)
const clients: RealtimeClient[] = []
function socket(token: string) {
  const client = new RealtimeClient(`${config.url}/realtime/v1`, {
    params: { apikey: config.apiKey },
  })
  clients.push(client)
  return client.setAuth(token).then(() => client)
}
async function subscribe(
  client: RealtimeClient,
  topic: string,
  expectDenied = false,
) {
  const channel = client.channel(topic, {
    config: { private: true, broadcast: { self: false } },
  })
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('WebSocket join timed out')),
      12000,
    )
    channel.subscribe((status) => {
      if (
        status === 'SUBSCRIBED' ||
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT'
      ) {
        clearTimeout(timeout)
        if ((status === 'SUBSCRIBED') === !expectDenied) resolve()
        else reject(new Error(`Unexpected subscription status: ${status}`))
      }
    })
  })
  return channel
}
try {
  const a = await socket(config.token),
    b = await socket(config.token)
  // Attach the receiver before subscribe, as required by Realtime.
  const receiver = b.channel(config.topic, { config: { private: true } })
  let receive!: (value: { body: string; signature: string }) => void
  const arrived = new Promise<{ body: string; signature: string }>(
    (resolve) => {
      receive = resolve
    },
  )
  receiver.on('broadcast', { event: 'state' }, ({ payload }) =>
    receive(payload),
  )
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Receiver join timed out')),
      12000,
    )
    receiver.subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(timeout)
        resolve()
      } else if (status === 'CHANNEL_ERROR') {
        clearTimeout(timeout)
        reject(
          new Error(
            'Receiver authorization failed: ' +
              String(error?.message).replace(
                /[\w-]{20,}\.[\w-]{20,}\.[\w-]{20,}/g,
                '[token]',
              ),
          ),
        )
      }
    })
  })
  const sender = await subscribe(a, config.topic)
  const identity = await verifyCertificate(
    config.certificate,
    await publicKey(config.verificationKey),
    room,
  )
  assert.ok(identity)
  const body = JSON.stringify({
    clientId,
    sequence: 1,
    cursor: { x: 120, y: 130 },
  })
  const signature = await signMessage(keys.privateKey, body)
  const started = performance.now()
  await sender.send({
    type: 'broadcast',
    event: 'state',
    payload: { body, signature },
  })
  const message = await Promise.race([
    arrived,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Broadcast timed out')), 12000).unref(),
    ),
  ])
  assert.equal(message.body, body)
  assert.ok(
    await verifyMessage(
      await publicKey(identity.publicKey),
      message.body,
      message.signature,
    ),
  )
  console.log(
    `Authenticated WebSocket broadcast delivered and verified in ${Math.round(performance.now() - started)} ms (single sample).`,
  )
  await subscribe(a, `pomegranate:live:other-${randomUUID()}`, true)
  console.log(
    'Cross-workspace subscription denied. No cursor rows or planning documents written.',
  )
} finally {
  await Promise.all(
    clients.map(async (client) => {
      await client.removeAllChannels()
      client.disconnect()
    }),
  )
}
