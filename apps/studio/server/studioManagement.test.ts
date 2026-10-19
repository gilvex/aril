import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { createApp } from './app.ts'
import { openStore } from './store.ts'
import { writeVersion } from '@aril/domain/freshness'

test('workspace owners rename and delete atomically; roles, confirmations, links and other workspaces stay safe', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'aril-management-'))
  const file = join(dir, 'fixture.sqlite')
  const { app, store, collaboration } = createApp(file)
  const owner = store.identity.bootstrap()!
  const target = store.createStudio(owner.profile.id, 'Project')
  const other = store.createStudio(owner.profile.id, 'Keep me')
  const original = store.read(target.id)
  const invite = store.identity.invite(owner.profile.id, target.id)
  const editor = store.identity.join(invite.token, 'Editor')!
  const viewer = store.identity.join(
    store.identity.invite(owner.profile.id, target.id).token,
    'Viewer',
  )!
  await store.access.update(
    owner.profile.id,
    target.id,
    viewer.profile.id,
    'viewer',
  )
  const outsider = store.identity.registerAccount(
    'yandex',
    'https://login.yandex.ru',
    'outsider',
    'fixture@example.test',
    'Outsider',
  )
  const link = await store.guests.create(
    owner.profile.id,
    target.id,
    'Guest link',
    60,
  )
  const guest = store.identity.redeemGuest(link.token, 'Guest')!
  const unused = store.identity.invite(owner.profile.id, target.id)
  const agent = await store.agents.create(
    owner.profile.id,
    target.id,
    'Agent',
    'write',
    1,
  )
  const accountAgent = await store.agents.create(
    owner.profile.id,
    other.id,
    'Account',
    'read',
    1,
    'account',
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  t.after(async () => {
    collaboration.close()
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(dir, { recursive: true, force: true })
  })
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const call = (token: string, method: string, body: unknown, id = target.id) =>
    fetch(origin + '/api/studios/' + id, {
      method,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        'x-pomegranate-write-version': writeVersion,
      },
      body: JSON.stringify(body),
    })
  assert.equal((await call('', 'DELETE', { name: 'Project' })).status, 401)
  for (const user of [editor, viewer, guest, outsider]) {
    assert.equal(
      (
        await call(user.token, 'PATCH', {
          name: 'Stolen',
          expectedName: 'Project',
        })
      ).status,
      403,
    )
    assert.equal(
      (await call(user.token, 'DELETE', { name: 'Project' })).status,
      403,
    )
    assert.equal(
      store.renameStudio(user.profile.id, target.id, 'Stolen', 'Project'),
      false,
    )
    assert.equal(
      store.deleteStudio(user.profile.id, target.id, 'Project'),
      false,
    )
  }
  assert.equal(
    (await call(owner.token, 'PATCH', { name: ' ', expectedName: 'Project' }))
      .status,
    400,
  )
  assert.equal(
    (
      await call(owner.token, 'PATCH', {
        name: 'x'.repeat(101),
        expectedName: 'Project',
      })
    ).status,
    400,
  )
  assert.equal(
    (
      await call(owner.token, 'PATCH', {
        name: 'Renamed',
        expectedName: 'Stale',
      })
    ).status,
    409,
  )
  assert.equal(
    (
      await call(owner.token, 'PATCH', {
        name: ' Renamed ',
        expectedName: 'Project',
      })
    ).status,
    204,
  )
  assert.equal(
    store.studios(owner.profile.id).find((s) => s.id === target.id)?.name,
    'Renamed',
  )
  assert.equal(
    store.studios(editor.profile.id).find((s) => s.id === target.id)?.name,
    'Renamed',
  )
  assert.deepEqual(store.read(target.id), original)
  assert.equal((await call(owner.token, 'DELETE', {})).status, 400)
  assert.equal(
    (await call(owner.token, 'DELETE', { name: 'Project' })).status,
    409,
  )
  assert.equal(store.member(editor.profile.id, target.id), true)
  store.save(
    original.workspace,
    original.revision,
    {
      id: owner.profile.id,
      name: 'Owner',
      message: 'Fixture save',
      requestId: 'fixture',
    },
    target.id,
    owner.profile.id,
  )
  const streamController = new AbortController()
  const stream = await fetch(
    origin + '/api/events?clientId=' + crypto.randomUUID(),
    {
      headers: {
        Authorization: 'Bearer ' + editor.token,
        'x-workspace-id': target.id,
      },
      signal: streamController.signal,
    },
  )
  assert.equal(stream.status, 200)
  const reader = stream.body!.getReader()
  await reader.read()
  const ended = (async () => {
    while (!(await reader.read()).done) {
      /* Drain queued presence frames. */
    }
  })()
  const timeout = setTimeout(() => streamController.abort(), 3000)
  assert.equal(
    (await call(owner.token, 'DELETE', { name: 'Renamed' })).status,
    204,
  )
  try {
    await ended
  } finally {
    clearTimeout(timeout)
    streamController.abort()
  }
  assert.equal(store.member(owner.profile.id, target.id), false)
  assert.equal(store.identity.join(unused.token, 'Later'), null)
  assert.equal(store.identity.redeemGuest(link.token, 'Later guest'), null)
  assert.equal(store.identity.authenticate(guest.token), undefined)
  assert.equal(await store.agents.authenticate(agent.token), undefined)
  assert.ok(await store.agents.authenticate(accountAgent.token))
  assert.ok(store.identity.authenticate(owner.token))
  assert.throws(() => store.read(target.id), /not found/)
  assert.ok(store.read(other.id))
  assert.equal(
    (await call(owner.token, 'DELETE', { name: 'Renamed' })).status,
    403,
  )
  const db = new DatabaseSync(file)
  for (const table of [
    'studios',
    'members',
    'documents',
    'studio_snapshots',
    'studio_activity',
    'studio_receipts',
    'invites',
    'agent_credentials',
  ]) {
    const column = table === 'studios' ? 'id' : 'workspace_id'
    assert.equal(
      db
        .prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ${column}=?`)
        .get(target.id)?.count,
      0,
    )
  }
  db.close()
  const reopened = openStore(file)
  assert.equal(
    reopened.studios(owner.profile.id).some((s) => s.id === target.id),
    false,
  )
  reopened.close()
  // The original workspace can also be deleted and must not be recreated at restart.
  assert.equal(store.deleteStudio(owner.profile.id, 'default', 'Aril'), true)
  const afterDefault = openStore(file)
  assert.throws(() => afterDefault.read('default'), /not found/)
  assert.ok(afterDefault.read(other.id))
  afterDefault.close()
})
