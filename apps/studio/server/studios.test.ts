import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from './app.ts'
import { openStore } from './store.ts'
import { createSeed } from '@pomegranate/domain/seed'

test('legacy migration keeps documents, history and existing invited memberships', () => {
  const directory = mkdtempSync(join(tmpdir(), 'pomegranate-migrate-'))
  const path = join(directory, 'test.sqlite')
  const old = new DatabaseSync(path)
  old.exec(`CREATE TABLE workspace (revision INTEGER, body TEXT, saved_at TEXT);
    CREATE TABLE snapshots (revision INTEGER, body TEXT, saved_at TEXT);
    CREATE TABLE profiles (id TEXT PRIMARY KEY,name TEXT,avatar TEXT,color TEXT);`)
  const workspace = { ...createSeed(), notes: 'Real user work stays here.' }
  old
    .prepare('INSERT INTO workspace VALUES (?,?,?)')
    .run(67, JSON.stringify(workspace), '2026-10-05')
  old
    .prepare('INSERT INTO snapshots VALUES (?,?,?)')
    .run(66, JSON.stringify(workspace), '2026-10-04')
  old.exec(
    "INSERT INTO profiles VALUES ('owner','Owner','','#b34568'),('invited','Invited','','#426cbd')",
  )
  old.close()
  let store = openStore(path)
  try {
    assert.equal(store.read().revision, 67)
    assert.deepEqual(store.read().workspace, workspace)
    assert.equal(store.snapshot(66)?.notes, workspace.notes)
    assert.equal(store.studios('invited')[0].id, 'default')
    const isolated = store.createStudio('owner', 'Private')
    const invite = store.identity.invite('owner', isolated.id)
    const newUser = store.identity.join(invite.token, 'New user')!
    store.close()
    store = openStore(path)
    assert.equal(
      store.member(newUser.profile.id, 'default'),
      false,
      'migration must never auto-enroll later users',
    )
    assert.deepEqual(
      store.studios(newUser.profile.id).map((s) => s.id),
      [isolated.id],
    )
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('workspace APIs isolate membership, documents, history, invites and event streams', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pomegranate-studios-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'test.sqlite'),
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const call = (
    path: string,
    token: string,
    workspaceId = 'default',
    method = 'GET',
    body?: unknown,
  ) =>
    fetch(url + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-workspace-id': workspaceId,
        'Content-Type': 'application/json',
        'x-pomegranate-write-version': '2',
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  try {
    const owner = store.identity.bootstrap()!
    const invited = store.identity.join(
      store.identity.invite(owner.profile.id).token,
      'Mira',
    )!
    const response = await call(
      '/api/studios',
      owner.token,
      'default',
      'POST',
      { name: 'Private deployment ideas' },
    )
    assert.equal(response.status, 201)
    const studio = (await response.json()) as { id: string }
    assert.deepEqual(
      (
        (await (await call('/api/studios', invited.token)).json()) as {
          id: string
        }[]
      ).map((s) => s.id),
      ['default'],
    )
    for (const path of [
      '/api/workspace',
      '/api/history',
      '/api/history/1',
      '/api/events?clientId=test',
    ])
      assert.equal(
        (await call(path, invited.token, studio.id)).status,
        403,
        path,
      )
    for (const path of ['/api/invites', '/api/presence'])
      assert.equal(
        (await call(path, invited.token, studio.id, 'POST', {})).status,
        403,
        path,
      )
    assert.equal(
      (await call('/api/workspace', invited.token, studio.id, 'PATCH', {}))
        .status,
      403,
    )
    assert.equal(
      (await call('/api/workspace', invited.token, studio.id, 'PUT', {}))
        .status,
      403,
    )
    const blank = store.read(studio.id)
    assert.equal(blank.workspace.boards[0].nodes.length, 0)
    assert.equal(blank.workspace.requirements.length, 0)
    store.save(
      { ...blank.workspace, notes: 'Private notes' },
      1,
      {
        id: owner.profile.id,
        name: 'Owner',
        message: 'Edited notes',
        requestId: 'same',
      },
      studio.id,
    )
    assert.equal(store.read().revision, 1)
    assert.equal(store.history().length, 0)
    assert.equal(store.activity().length, 0)
    assert.equal(store.receipt(owner.profile.id, 'same'), false)
    const controller = new AbortController()
    const stream = await fetch(
      `${url}/api/events?clientId=${crypto.randomUUID()}`,
      {
        headers: { Authorization: `Bearer ${owner.token}` },
        signal: controller.signal,
      },
    )
    assert.equal(stream.status, 200)
    const reader = stream.body!.getReader()
    const decoder = new TextDecoder()
    collaboration.broadcast('probe', { value: 'private-secret' }, studio.id)
    collaboration.broadcast('probe', { value: 'public-marker' }, 'default')
    let received = ''
    const timeout = setTimeout(() => controller.abort(), 5000)
    try {
      while (!received.includes('public-marker')) {
        const part = await reader.read()
        if (part.done) throw new Error('Event stream ended')
        received += decoder.decode(part.value, { stream: true })
      }
      assert.equal(
        received.includes('private-secret'),
        false,
        'private broadcasts cannot reach another workspace',
      )
    } finally {
      clearTimeout(timeout)
      controller.abort()
      await reader.cancel().catch(() => {})
    }
    const invitation = store.identity.invite(owner.profile.id, studio.id)
    const joined = (await (
      await call('/api/join', invited.token, 'default', 'POST', {
        token: invitation.token,
        name: 'Ignored',
      })
    ).json()) as { profile: { id: string }; token: string }
    assert.equal(joined.profile.id, invited.profile.id)
    assert.equal(joined.token, '')
    assert.equal(store.studios(invited.profile.id).length, 2)
    assert.equal(
      (await call('/api/workspace', invited.token, studio.id)).status,
      200,
    )
    assert.equal(
      (
        await call('/api/join', invited.token, 'default', 'POST', {
          token: invitation.token,
          name: 'Ignored',
        })
      ).status,
      403,
    )
  } finally {
    collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('Google endpoint rejects invalid credentials without creating accounts or sessions', async () => {
  const previous = process.env.GOOGLE_CLIENT_ID
  process.env.GOOGLE_CLIENT_ID = 'test.apps.googleusercontent.com'
  const directory = mkdtempSync(join(tmpdir(), 'pomegranate-google-reject-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'test.sqlite'),
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  try {
    const owner = store.identity.bootstrap()!
    const headers = {
      Authorization: `Bearer ${owner.token}`,
      'Content-Type': 'application/json',
      'x-pomegranate-auth': '1',
    }
    const challenge = (await (
      await fetch(url + '/api/auth/google/challenge', {
        method: 'POST',
        headers,
      })
    ).json()) as { challenge: string }
    const response = await fetch(url + '/api/auth/google', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        credential: 'not-a-valid-token',
        challenge: challenge.challenge,
        link: true,
      }),
    })
    assert.equal(response.status, 401)
    assert.equal(store.identity.account(owner.profile.id), undefined)
    assert.equal(response.headers.get('set-cookie'), null)
    assert.equal(
      (await fetch(url + '/api/auth/google/challenge', { method: 'POST' }))
        .status,
      400,
    )
  } finally {
    if (previous === undefined) delete process.env.GOOGLE_CLIENT_ID
    else process.env.GOOGLE_CLIENT_ID = previous
    collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('Google linking keeps memberships, requires a known subject and rejects identity takeover', () => {
  const directory = mkdtempSync(join(tmpdir(), 'pomegranate-accounts-'))
  const path = join(directory, 'test.sqlite')
  let store = openStore(path)
  try {
    const owner = store.identity.bootstrap()!
    const invited = store.identity.join(
      store.identity.invite(owner.profile.id).token,
      'Mira',
    )!
    const studio = store.createStudio(invited.profile.id, 'Mira’s workspace')
    assert.equal(store.identity.signInGoogle('unknown'), null)
    assert.equal(
      store.identity.linkGoogle(
        invited.profile.id,
        'google-subject',
        'mira@example.com',
      ),
      true,
    )
    assert.equal(
      store.identity.linkGoogle(
        owner.profile.id,
        'google-subject',
        'mira@example.com',
      ),
      false,
    )
    assert.equal(
      store.identity.linkGoogle(
        invited.profile.id,
        'other-subject',
        'mira@example.com',
      ),
      false,
    )
    const challenge = store.identity.challenge(invited.profile.id)
    assert.equal(
      store.identity.consumeChallenge(challenge.challenge, owner.profile.id),
      undefined,
    )
    const valid = store.identity.challenge(invited.profile.id)
    assert.equal(
      store.identity.consumeChallenge(valid.challenge, invited.profile.id),
      valid.nonce,
    )
    assert.equal(
      store.identity.consumeChallenge(valid.challenge, invited.profile.id),
      undefined,
    )
    store.close()
    store = openStore(path)
    const signedIn = store.identity.signInGoogle('google-subject')!
    assert.equal(signedIn.profile.id, invited.profile.id)
    assert.notEqual(signedIn.token, invited.token)
    assert.equal(store.member(signedIn.profile.id, studio.id), true)
    assert.equal(store.studios(signedIn.profile.id).length, 2)
    assert.equal(
      store.identity.authenticate(signedIn.token)?.id,
      invited.profile.id,
    )
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})
