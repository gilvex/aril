import { writeVersion } from '@pomegranate/domain/freshness'
import {
  applyOperations,
  diffWorkspace,
  type Operation,
} from '@pomegranate/domain/collaboration'
import { createSeed } from '@pomegranate/domain/seed'
import { makeWireNode } from '@pomegranate/domain/wireframe'
import type { Envelope } from '@pomegranate/domain/workspace'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createApp } from './app.ts'
import { openStore } from './store.ts'

async function events(
  url: string,
  cookie: string,
  clientId: string,
  token?: string,
) {
  const controller = new AbortController()
  const response = await fetch(`${url}/api/events?clientId=${clientId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : { Cookie: cookie },
    signal: controller.signal,
  })
  assert.equal(response.status, 200)
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  async function next(
    event: string,
    accepts: (data: unknown) => boolean = () => true,
  ): Promise<unknown> {
    const timeout = setTimeout(() => controller.abort(), 5000)
    try {
      for (;;) {
        let boundary = buffer.indexOf('\n\n')
        while (boundary >= 0) {
          const block = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)
          const type = block
            .split('\n')
            .find((line) => line.startsWith('event: '))
            ?.slice(7)
          const raw = block
            .split('\n')
            .find((line) => line.startsWith('data: '))
            ?.slice(6)
          if (raw && type === event) {
            const data: unknown = JSON.parse(raw)
            if (accepts(data)) return data
          }
          boundary = buffer.indexOf('\n\n')
        }
        const chunk = await reader.read()
        if (chunk.done) throw new Error('Live stream ended unexpectedly')
        buffer += decoder.decode(chunk.value, { stream: true })
      }
    } finally {
      clearTimeout(timeout)
    }
  }
  return { next, close: () => controller.abort() }
}

test('invited users share edits, profiles, cursors and activity without stale overwrites', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pomegranate-multiplayer-'))
  const database = join(directory, 'test.sqlite')
  const { app, store, collaboration } = createApp(database)
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const call = (path: string, cookie = '', method = 'GET', body?: unknown) =>
    fetch(url + path, {
      method,
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
        'x-pomegranate-write-version': writeVersion,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  let streamA: Awaited<ReturnType<typeof events>> | undefined
  let streamB: Awaited<ReturnType<typeof events>> | undefined
  let cookieA: string
  try {
    assert.equal((await call('/api/workspace')).status, 401)
    const owner = await call('/api/session')
    cookieA = owner.headers.get('set-cookie')!.split(';')[0]
    const ownerProfile = ((await owner.json()) as { profile: { id: string } })
      .profile
    assert.equal((await call('/api/session')).status, 401)
    assert.equal((await call('/api/invites', '', 'POST')).status, 401)
    const invitation = (await (
      await call('/api/invites', cookieA, 'POST')
    ).json()) as { token: string }
    const googleUser = store.identity.registerGoogle(
      'sam-subject',
      'sam@example.test',
      'Sam',
    )
    const cookieB = 'pomegranate_session=' + googleUser.token
    const joinResponse = await call('/api/join', cookieB, 'POST', {
      token: invitation.token,
      name: 'Sam',
    })
    assert.equal(joinResponse.status, 200)
    assert.equal(joinResponse.headers.get('set-cookie'), null)
    const joined = (await joinResponse.json()) as {
      profile: { id: string }
      token: string
    }
    joined.token = googleUser.token
    const peerProfile = joined.profile
    const bearerSession = await fetch(`${url}/api/session`, {
      headers: { Authorization: `Bearer ${joined.token}` },
    })
    assert.equal(bearerSession.status, 200)
    const restored = (await bearerSession.json()) as { profile: { id: string } }
    assert.equal(restored.profile.id, peerProfile.id)
    assert.notEqual(ownerProfile.id, peerProfile.id)
    assert.equal(
      (
        await call('/api/join', cookieB, 'POST', {
          token: invitation.token,
          name: 'Imposter',
        })
      ).status,
      403,
    )
    const clientA = randomUUID()
    const clientB = randomUUID()
    streamA = await events(url, cookieA, clientA)
    streamB = await events(url, '', clientB, joined.token)
    const people = (await streamA.next(
      'presence',
      (value) => Array.isArray(value) && value.length === 2,
    )) as { profile: { id: string } }[]
    assert.equal(people.length, 2)
    const initial = (await (
      await call('/api/workspace', cookieA)
    ).json()) as Envelope
    const changeA = structuredClone(initial.workspace)
    changeA.boards[0].nodes[0].data.title = 'Runtime edited by owner'
    const changeB = structuredClone(initial.workspace)
    changeB.boards[0].nodes[0].position = { x: 77, y: 88 }
    const patch = async (
      cookie: string,
      operations: Operation[],
      requestId = randomUUID(),
    ) =>
      call('/api/workspace', cookie, 'PATCH', {
        operations,
        requestId,
        baseRevision: store.read().revision,
      })
    const requestId = randomUUID()
    assert.equal(
      (
        await patch(
          cookieA,
          diffWorkspace(initial.workspace, changeA),
          requestId,
        )
      ).status,
      200,
    )
    assert.equal(
      (await patch(cookieB, diffWorkspace(initial.workspace, changeB))).status,
      200,
    )
    let shared = (await (
      await call('/api/workspace', cookieA)
    ).json()) as Envelope
    assert.equal(
      shared.workspace.boards[0].nodes[0].data.title,
      'Runtime edited by owner',
    )
    assert.deepEqual(shared.workspace.boards[0].nodes[0].position, {
      x: 77,
      y: 88,
    })
    await streamB.next(
      'workspace',
      (value) => (value as Envelope).revision === shared.revision,
    )
    const activity = (await streamB.next('activity')) as { name: string }[]
    assert.equal(activity[0].name, 'Sam')
    const countBefore = store.activity().length
    assert.equal(
      (
        await patch(
          cookieA,
          diffWorkspace(initial.workspace, changeA),
          requestId,
        )
      ).status,
      200,
    )
    assert.equal(store.activity().length, countBefore)
    const conflict = structuredClone(initial.workspace)
    conflict.boards[0].nodes[0].data.title = 'Stale competing title'
    assert.equal(
      (await patch(cookieB, diffWorkspace(initial.workspace, conflict))).status,
      409,
    )
    assert.equal(
      (await patch(cookieB, [{ path: ['__proto__', 'polluted'], after: true }]))
        .status,
      400,
    )
    assert.equal(
      (
        await patch(cookieB, [
          {
            path: ['boards', 'layers', 'nodes', 'base'],
            before: shared.workspace.boards[0]
              .nodes[0] as unknown as Operation['before'],
          },
        ])
      ).status,
      409,
    )
    const picture =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nYsAAAAASUVORK5CYII='
    assert.equal(
      (
        await call('/api/profile', cookieB, 'PUT', {
          name: 'Sam renamed',
          avatar: picture,
        })
      ).status,
      200,
    )
    const updatedPeople = (await streamA.next('presence', (value) =>
      (value as { profile: { name: string } }[]).some(
        (p) => p.profile.name === 'Sam renamed',
      ),
    )) as { profile: { name: string; avatar: string } }[]
    assert.equal(
      updatedPeople.find((p) => p.profile.name === 'Sam renamed')!.profile
        .avatar,
      picture,
    )
    assert.equal(
      (
        await call('/api/profile', cookieB, 'PUT', {
          name: 'Sam',
          avatar: 'data:image/svg+xml;base64,PHN2Zz4=',
        })
      ).status,
      400,
    )
    // A client cannot supply another member's identity with a presence update.
    await new Promise((resolve) => setTimeout(resolve, 70))
    await call('/api/presence', cookieB, 'POST', {
      clientId: clientB,
      boardId: 'layers',
      view: 'canvas',
      cursor: { x: 125, y: 260 },
      selected: ['base'],
      profile: { id: ownerProfile.id },
    })
    const cursorPeople = (await streamA.next('presence', (value) =>
      (value as { cursor: { x: number } | null }[]).some(
        (p) => p.cursor?.x === 125,
      ),
    )) as {
      profile: { id: string }
      cursor: { x: number } | null
      selected: string[]
    }[]
    const cursorPeer = cursorPeople.find((p) => p.cursor?.x === 125)!
    assert.equal(cursorPeer.profile.id, peerProfile.id)
    assert.deepEqual(cursorPeer.selected, ['base'])
    // Drag frames are ephemeral, include whole selections, and reject late packets.
    const revisionBeforeDrag = store.read().revision
    const dragFrame = {
      clientId: clientB,
      boardId: 'layers',
      view: 'canvas',
      cursor: { x: 150, y: 270 },
      selected: ['base', 'game'],
      sequence: 100,
      selectedEdges: [initial.workspace.boards[0].edges[0].id],
      dragging: [
        { id: 'base', position: { x: 150, y: 270 } },
        { id: 'game', position: { x: 450, y: 270 } },
      ],
    }
    assert.equal(
      (await call('/api/presence', cookieB, 'POST', dragFrame)).status,
      204,
    )
    const dragPeople = (await streamA.next('presence', (value) =>
      (value as { sequence?: number }[]).some((p) => p.sequence === 100),
    )) as { sequence?: number; dragging: unknown[]; selectedEdges: string[] }[]
    assert.deepEqual(
      dragPeople.find((p) => p.sequence === 100)!.dragging,
      dragFrame.dragging,
    )
    assert.deepEqual(
      dragPeople.find((p) => p.sequence === 100)!.selectedEdges,
      dragFrame.selectedEdges,
    )
    assert.equal(store.read().revision, revisionBeforeDrag)
    await call('/api/presence', cookieB, 'POST', {
      ...dragFrame,
      sequence: 99,
      dragging: [],
    })
    await call('/api/presence', cookieA, 'POST', {
      clientId: clientA,
      boardId: 'layers',
      view: 'canvas',
      cursor: null,
      selected: [],
      sequence: 200,
    })
    const orderedPeople = (await streamA.next('presence', (value) =>
      (value as { sequence?: number }[]).some((p) => p.sequence === 200),
    )) as { sequence?: number; dragging: unknown[] }[]
    assert.deepEqual(
      orderedPeople.find((p) => p.sequence === 100)!.dragging,
      dragFrame.dragging,
    )
    assert.equal(
      (
        await call('/api/presence', cookieB, 'POST', {
          ...dragFrame,
          dragging: [{ id: 'base', position: { x: 1e20, y: 0 } }],
        })
      ).status,
      400,
    )
    await call('/api/presence', cookieB, 'POST', {
      ...dragFrame,
      sequence: 101,
      dragging: [],
      selectedEdges: [],
      boardId: null,
      view: 'notes',
    })
    const endedPeople = (await streamA.next('presence', (value) =>
      (value as { sequence?: number }[]).some((p) => p.sequence === 101),
    )) as {
      sequence?: number
      dragging: unknown[]
      selectedEdges: string[]
      boardId: string | null
      view: string
    }[]
    assert.deepEqual(endedPeople.find((p) => p.sequence === 101)!.dragging, [])
    assert.deepEqual(
      endedPeople.find((p) => p.sequence === 101)!.selectedEdges,
      [],
    )
    assert.equal(endedPeople.find((p) => p.sequence === 101)!.view, 'notes')
    assert.equal(endedPeople.find((p) => p.sequence === 101)!.boardId, null)
    assert.equal(store.read().revision, revisionBeforeDrag)
    const requirementId = initial.workspace.requirements[0].id
    await call('/api/presence', cookieB, 'POST', {
      ...dragFrame,
      sequence: 102,
      boardId: null,
      view: 'requirements',
      dragging: [],
      selectedEdges: [],
      requirement: { id: requirementId, field: 'acceptance', typing: true },
    })
    await call('/api/presence', cookieA, 'POST', {
      clientId: clientA,
      boardId: null,
      view: 'requirements',
      cursor: null,
      selected: [],
      sequence: 201,
      requirement: { id: requirementId, field: null, typing: false },
    })
    const requirementPeople = (await streamA.next('presence', (value) =>
      (value as { sequence?: number }[]).some((p) => p.sequence === 201),
    )) as {
      requirement: { id: string; field: string | null; typing: boolean }
    }[]
    assert.equal(
      requirementPeople.filter((p) => p.requirement?.id === requirementId)
        .length,
      2,
    )
    assert.equal(
      requirementPeople.find((p) => p.requirement?.field === 'acceptance')!
        .requirement.typing,
      true,
    )
    assert.equal(
      (
        await call('/api/presence', cookieB, 'POST', {
          ...dragFrame,
          sequence: 103,
          requirement: { id: requirementId, field: 'password', typing: true },
        })
      ).status,
      400,
    )
    await call('/api/presence', cookieB, 'POST', {
      ...dragFrame,
      sequence: 103,
      boardId: null,
      view: 'notes',
      dragging: [],
      requirement: null,
    })
    const clearedPeople = (await streamA.next('presence', (value) =>
      (value as { sequence?: number }[]).some((p) => p.sequence === 103),
    )) as { requirement: { id: string } | null }[]
    assert.equal(
      clearedPeople.filter((p) => p.requirement?.id === requirementId).length,
      1,
    )
    assert.equal(store.read().revision, revisionBeforeDrag)
    streamB.close()
    streamB = undefined
    await streamA.next(
      'presence',
      (value) => Array.isArray(value) && value.length === 1,
    )
    // Reconnecting receives the latest durable document, without replay dependencies.
    streamB = await events(url, cookieB, randomUUID())
    shared = (await streamB.next('workspace')) as Envelope
    assert.equal(
      shared.workspace.boards[0].nodes[0].data.title,
      'Runtime edited by owner',
    )
    const withWireframe = structuredClone(shared.workspace)
    const screen = makeWireNode('screen', 'wire-screen', { x: 20, y: 30 })
    const button = makeWireNode(
      'button',
      'wire-button',
      { x: 40, y: 80 },
      screen.id,
    )
    withWireframe.boards[0].wireframe = {
      nodes: [screen, button],
      edges: [
        {
          id: 'wire-flow',
          source: button.id,
          target: screen.id,
          label: 'On click',
          type: 'smoothstep',
        },
      ],
    }
    assert.equal(
      (
        await call('/api/workspace', cookieA, 'PATCH', {
          requestId: randomUUID(),
          baseRevision: shared.revision,
          operations: diffWorkspace(shared.workspace, withWireframe),
        })
      ).status,
      200,
    )
    await streamB.next(
      'workspace',
      (value) =>
        (value as Envelope).workspace.boards[0].wireframe?.edges[0]?.id ===
        'wire-flow',
    )
    await call('/api/presence', cookieA, 'POST', {
      clientId: clientA,
      boardId: 'layers',
      view: 'wireframes',
      cursor: { x: 40, y: 80 },
      selected: [button.id],
      selectedEdges: ['wire-flow'],
      sequence: 300,
      dragging: [{ id: button.id, position: { x: 60, y: 80 } }],
    })
    const wirePeople = (await streamB.next('presence', (value) =>
      (value as { view: string }[]).some((p) => p.view === 'wireframes'),
    )) as { view: string; selected: string[]; dragging: { id: string }[] }[]
    assert.deepEqual(
      wirePeople.find((p) => p.view === 'wireframes')!.selected,
      [button.id],
    )
    assert.equal(
      wirePeople.find((p) => p.view === 'wireframes')!.dragging[0].id,
      button.id,
    )
  } finally {
    streamA?.close()
    streamB?.close()
    collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
  }
  try {
    const reopened = openStore(database)
    assert.equal(
      reopened.identity.authenticate(cookieA.split('=')[1])?.name,
      'Workspace owner',
    )
    assert.equal(
      reopened.read().workspace.boards[0].nodes[0].data.title,
      'Runtime edited by owner',
    )
    assert.equal(reopened.activity().length, 3)
    assert.equal(
      reopened.read().workspace.boards[0].wireframe!.edges[0].label,
      'On click',
    )
    reopened.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('inverse local operations preserve other users changes and cameras stay local', () => {
  const before = createSeed()
  const after = structuredClone(before)
  after.boards[0].nodes[0].position = { x: 50, y: 70 }
  after.boards[0].nodes[1].position = { x: 340, y: 70 }
  after.boards[0].viewport = { x: 400, y: 300, zoom: 2 }
  const mine = diffWorkspace(before, after)
  assert.equal(mine.length, 2)
  const theirs = structuredClone(after)
  theirs.boards[0].nodes[2].data.title = 'Collaborator title'
  const inverse = mine.map((op) => ({
    path: op.path,
    before: op.after,
    after: op.before,
  }))
  const undone = applyOperations(theirs, inverse)
  assert.deepEqual(
    undone.boards[0].nodes[0].position,
    before.boards[0].nodes[0].position,
  )
  assert.equal(undone.boards[0].nodes[2].data.title, 'Collaborator title')
  const movedAgain = structuredClone(theirs)
  movedAgain.boards[0].nodes[0].position.x++
  assert.throws(() => applyOperations(movedAgain, inverse), /Someone changed/)
})
