// Explicit deployment smoke test. Only generated fixture IDs are removed.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { openPostgres } from '../server/postgres.ts'
import { diffWorkspace } from '../domain/collaboration.ts'
import { makeWireNode } from '../domain/wireframe.ts'
import type { Envelope } from '../domain/workspace.ts'

const origin = process.env.SMOKE_ORIGIN
if (!origin) throw new Error('Set SMOKE_ORIGIN to the deployment being tested.')
const store = await openPostgres()
const ownerId = randomUUID(),
  userIds = [ownerId]
let workspaceId = ''
const controllers: AbortController[] = []
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
  assert.equal(presence.status, 204)
  await a.next('presence', (value) =>
    (value as { profile: { id: string }; cursor?: { x: number } }[]).some(
      (p) => p.profile.id === peer.profile.id && p.cursor?.x === 120,
    ),
  )
  const patch = await call('/api/workspace', peer.token, 'PATCH', {
    requestId: randomUUID(),
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
  assert.equal(
    (
      await call('/api/presence', peer.token, 'POST', {
        clientId: peerClient,
        boardId: latest.workspace.boards[0].id,
        view: 'wireframes',
        cursor: { x: 100, y: 100 },
        selected: [button.id],
        selectedEdges: [],
        sequence: 2,
        dragging: [{ id: button.id, position: { x: 50, y: 90 } }],
      })
    ).status,
    204,
  )
  await a.next('presence', (value) =>
    (value as { view: string; selected: string[] }[]).some(
      (p) => p.view === 'wireframes' && p.selected.includes(button.id),
    ),
  )
  a.close()
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
      presence: true,
      savedEdit: true,
      reconnect: true,
      wireframes: true,
    }),
  )
} finally {
  controllers.forEach((c) => c.abort())
  await store.transaction(async (client) => {
    for (const table of [
      'live_presence',
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
