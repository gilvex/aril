// Explicit deployment smoke test. Only generated fixture IDs are removed.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { openPostgres } from '../apps/studio/server/postgres.ts'
import { diffWorkspace } from '@pomegranate/domain/collaboration'
import { makeWireNode } from '@pomegranate/domain/wireframe'
import type { Envelope } from '@pomegranate/domain/workspace'
import { RealtimeClient } from '@supabase/realtime-js'
import {
  encode64,
  publicKey,
  verifyCertificate,
  type LiveConfig,
} from '@pomegranate/domain/liveSession'

const origin = process.env.SMOKE_ORIGIN
if (!origin) throw new Error('Set SMOKE_ORIGIN to the deployment being tested.')
const store = await openPostgres()
const ownerId = randomUUID(),
  userIds = [ownerId]
let workspaceId = ''
const controllers: AbortController[] = []
let realtime: RealtimeClient | undefined
async function call(
  path: string,
  token = '',
  method = 'GET',
  body?: unknown,
  workspace = workspaceId,
) {
  return fetch(origin + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      'x-pomegranate-auth': '1',
      'x-pomegranate-write-version': '2',
      'x-workspace-id': workspace,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20000),
  })
}
async function stream(token: string, clientId: string) {
  const controller = new AbortController()
  controllers.push(controller)
  const response = await fetch(origin + '/api/events?clientId=' + clientId, {
    headers: {
      Authorization: 'Bearer ' + token,
      'x-workspace-id': workspaceId,
    },
    signal: controller.signal,
  })
  assert.equal(response.status, 200)
  const reader = response.body!.getReader(),
    decoder = new TextDecoder()
  let buffer = ''
  return {
    close() {
      controller.abort()
    },
    async next(event: string, accept: (value: unknown) => boolean) {
      const timer = setTimeout(() => controller.abort(), 20000)
      try {
        for (;;) {
          const boundary = buffer.indexOf('\n\n')
          if (boundary >= 0) {
            const block = buffer.slice(0, boundary)
            buffer = buffer.slice(boundary + 2)
            if (block.startsWith(`event: ${event}\n`)) {
              const value = JSON.parse(block.split('\ndata: ')[1])
              if (accept(value)) return value
            }
          } else {
            const part = await reader.read()
            if (part.done) throw new Error('Stream ended before expected event')
            buffer += decoder.decode(part.value, { stream: true })
          }
        }
      } finally {
        clearTimeout(timer)
      }
    },
  }
}
try {
  await store.query('INSERT INTO studio.profiles VALUES ($1,$2,$3,$4)', [
    ownerId,
    'Deployment smoke owner',
    '',
    '#b34568',
  ])
  const transfer = await store.createTransfer(ownerId)
  const redeemed = await call('/api/auth/transfer', '', 'POST', {
    token: transfer,
  })
  assert.equal(redeemed.status, 200)
  const owner = (await redeemed.json()) as { token: string }
  assert.equal(
    (await call('/api/auth/transfer', '', 'POST', { token: transfer })).status,
    401,
  )
  const created = await call('/api/studios', owner.token, 'POST', {
    name: 'Temporary deployment verification',
  })
  assert.equal(created.status, 201)
  workspaceId = ((await created.json()) as { id: string }).id
  assert.equal(
    (await call('/api/workspace', owner.token, 'GET', undefined, 'default'))
      .status,
    403,
  )
  const inviteResponse = await call('/api/invites', owner.token, 'POST')
  assert.equal(inviteResponse.status, 200)
  const invite = (await inviteResponse.json()) as { token: string }
  const joined = await call('/api/join', '', 'POST', {
    token: invite.token,
    name: 'Deployment smoke peer',
  })
  assert.equal(joined.status, 200)
  const peer = (await joined.json()) as {
    token: string
    profile: { id: string }
  }
  userIds.push(peer.profile.id)
  assert.equal(
    (
      await call('/api/join', '', 'POST', {
        token: invite.token,
        name: 'Replay',
      })
    ).status,
    403,
  )
  const ownerClient = randomUUID(),
    peerClient = randomUUID()
  const a = await stream(owner.token, ownerClient),
    b = await stream(peer.token, peerClient)
  const initial = (await a.next('workspace', () => true)) as Envelope
  await b.next('workspace', () => true)
  const presence = await call('/api/presence', peer.token, 'POST', {
    clientId: peerClient,
    boardId: initial.workspace.boards[0].id,
    view: 'canvas',
    cursor: { x: 120, y: 130 },
    selected: [],
    sequence: 1,
  })
  assert.equal(presence.status, 428)
  const keys = await crypto.subtle.generateKey('Ed25519', true, [
    'sign',
    'verify',
  ])
  const liveResponse = await call('/api/realtime', peer.token, 'POST', {
    clientId: peerClient,
    publicKey: encode64(await crypto.subtle.exportKey('raw', keys.publicKey)),
  })
  assert.equal(liveResponse.status, 200)
  const live = (await liveResponse.json()) as LiveConfig
  assert.equal(
    (
      await verifyCertificate(
        live.certificate,
        await publicKey(live.verificationKey),
        workspaceId,
      )
    )?.profile.id,
    peer.profile.id,
  )
  realtime = new RealtimeClient(`${live.url}/realtime/v1`, {
    params: { apikey: live.apiKey },
  })
  await realtime.setAuth(live.token)
  const channel = realtime.channel(live.topic, { config: { private: true } })
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Deployed realtime authorization timed out')),
      15000,
    )
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(timeout)
        resolve()
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        clearTimeout(timeout)
        reject(new Error('Deployed realtime authorization failed'))
      }
    })
  })
  const patch = await call('/api/workspace', peer.token, 'PATCH', {
    requestId: randomUUID(),
    baseRevision: initial.revision,
    operations: diffWorkspace(initial.workspace, {
      ...initial.workspace,
      notes: 'Verified through the deployed API',
    }),
  })
  assert.equal(patch.status, 200)
  await a.next(
    'workspace',
    (value) =>
      (value as Envelope).workspace.notes ===
      'Verified through the deployed API',
  )
  assert.equal(
    (await store.read(workspaceId)).workspace.notes,
    'Verified through the deployed API',
  )
  const latest = await store.read(workspaceId)
  const withWireframe = structuredClone(latest.workspace)
  const screen = makeWireNode('screen', randomUUID(), { x: 0, y: 0 })
  const button = makeWireNode(
    'button',
    randomUUID(),
    { x: 30, y: 80 },
    screen.id,
  )
  withWireframe.boards[0].wireframe = {
    nodes: [screen, button],
    edges: [
      {
        id: randomUUID(),
        source: button.id,
        target: screen.id,
        label: 'On click',
        type: 'smoothstep',
      },
    ],
  }
  assert.equal(
    (
      await call('/api/workspace', peer.token, 'PATCH', {
        requestId: randomUUID(),
        baseRevision: latest.revision,
        operations: diffWorkspace(latest.workspace, withWireframe),
      })
    ).status,
    200,
  )
  await a.next(
    'workspace',
    (value) =>
      (value as Envelope).workspace.boards[0].wireframe?.nodes.length === 2,
  )
  assert.equal(
    (await store.read(workspaceId)).workspace.boards[0].wireframe!.edges[0]
      .label,
    'On click',
  )
  a.close()
  const protectedState = await store.read(workspaceId)
  const staleRemoval = {
    requestId: randomUUID(),
    baseRevision: latest.revision,
    operations: diffWorkspace(withWireframe, latest.workspace),
  }
  assert.equal(
    (await call('/api/workspace', peer.token, 'PATCH', staleRemoval)).status,
    409,
  )
  const oldPage = await fetch(origin + '/api/workspace', {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer ' + peer.token,
      'Content-Type': 'application/json',
      'x-workspace-id': workspaceId,
    },
    body: JSON.stringify({
      ...staleRemoval,
      baseRevision: protectedState.revision,
    }),
  })
  assert.equal(oldPage.status, 428)
  assert.deepEqual(await store.read(workspaceId), protectedState)
  const reconnect = await stream(owner.token, randomUUID())
  await reconnect.next(
    'workspace',
    (value) => (value as Envelope).revision === 3,
  )
  console.log(
    JSON.stringify({
      live: true,
      transfer: true,
      workspaces: true,
      isolation: true,
      invite: true,
      legacyPresenceWritesBlocked: true,
      privateWebSocketAuthorized: true,
      savedEdit: true,
      reconnect: true,
      wireframes: true,
      staleWritesBlocked: true,
    }),
  )
} finally {
  await realtime?.removeAllChannels()
  realtime?.disconnect()
  controllers.forEach((c) => c.abort())
  await store.transaction(async (client) => {
    for (const table of [
      'studio_receipts',
      'studio_activity',
      'studio_snapshots',
      'documents',
      'members',
      'invites',
    ])
      await store.query(
        `DELETE FROM studio.${table} WHERE workspace_id=$1`,
        [workspaceId],
        client,
      )
    await store.query(
      'DELETE FROM studio.studios WHERE id=$1',
      [workspaceId],
      client,
    )
    for (const table of [
      'sessions',
      'transfers',
      'auth_challenges',
      'accounts',
    ])
      await store.query(
        `DELETE FROM studio.${table} WHERE user_id=ANY($1::text[])`,
        [userIds],
        client,
      )
    await store.query(
      'DELETE FROM studio.profiles WHERE id=ANY($1::text[])',
      [userIds],
      client,
    )
  })
  await store.close()
  console.log('Temporary verification fixtures removed.')
}
