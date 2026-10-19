import { guestLinkNoExpiry } from '@aril/domain/collaboration'
import { openStore } from './store.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createApp } from './app.ts'
import { writeVersion } from '@aril/domain/freshness'

test('independent view/edit links enforce read-only access, expiry and revocation at API and storage boundaries', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'aril-view-links-'))
  const file = join(dir, 'fixture.sqlite')
  const { app, store, collaboration } = createApp(file)
  const owner = store.identity.bootstrap()!
  const privateStudio = store.createStudio(owner.profile.id, 'Private')
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
  const call = (token: string, path: string, method = 'GET', body?: unknown) =>
    fetch(origin + path, {
      method,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        'x-pomegranate-auth': '1',
        'x-pomegranate-write-version': writeVersion,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  const create = async (
    role: 'viewer' | 'member',
    minutes: number | null = 60,
  ) => {
    const response = await call(owner.token, '/api/guest-links', 'POST', {
      name: 'Fixture ' + role,
      minutes,
      role,
    })
    assert.equal(response.status, 201)
    return (await response.json()) as {
      id: string
      token: string
      role: 'viewer' | 'member'
    }
  }
  const view = await create('viewer', null),
    secondView = await create('viewer'),
    edit = await create('member', null)
  assert.equal(view.role, 'viewer')
  assert.notEqual(view.token, secondView.token)
  const listed = await store.guests.list('default')
  assert.equal(listed.length, 3)
  assert.deepEqual(listed.map((link) => link.role).sort(), [
    'member',
    'viewer',
    'viewer',
  ])
  assert.equal(
    listed.filter((link) => link.expiresAt === guestLinkNoExpiry).length,
    2,
  )
  const viewer = store.identity.redeemGuest(view.token, 'Viewer')!
  const another = store.identity.redeemGuest(secondView.token, 'Second viewer')!
  const editor = store.identity.redeemGuest(edit.token, 'Editor')!
  assert.equal(viewer.profile.guestExpiresAt, guestLinkNoExpiry)
  const sessions = new DatabaseSync(file)
  const sessionExpiry = Number(
    sessions
      .prepare('SELECT expires_at FROM sessions WHERE user_id=?')
      .get(viewer.profile.id)!.expires_at,
  )
  assert.ok(sessionExpiry <= Date.now() + 30 * 86400000)
  assert.ok(sessionExpiry > Date.now() + 29 * 86400000)
  sessions.close()
  assert.equal(
    await store.identity.linkGoogle(
      viewer.profile.id,
      'forbidden',
      'fixture@example.test',
    ),
    false,
  )
  assert.equal(await store.access.role(viewer.profile.id, 'default'), 'viewer')
  assert.equal(await store.access.role(editor.profile.id, 'default'), 'guest')
  assert.equal((await call(viewer.token, '/api/workspace')).status, 200)
  const document = store.read()
  assert.equal(
    (await call(viewer.token, '/api/workspace', 'PUT', document)).status,
    403,
  )
  assert.equal(
    (
      await call(viewer.token, '/api/workspace', 'PATCH', {
        baseRevision: document.revision,
        operations: [],
      })
    ).status,
    403,
  )
  assert.throws(() =>
    store.save(
      document.workspace,
      document.revision,
      undefined,
      'default',
      viewer.profile.id,
    ),
  )
  assert.equal(
    await store.access.update(
      owner.profile.id,
      'default',
      viewer.profile.id,
      'member',
    ),
    false,
  )
  assert.equal(
    (
      await call(owner.token, '/api/members/' + viewer.profile.id, 'PATCH', {
        role: 'member',
      })
    ).status,
    409,
  )
  assert.equal(
    (await call(editor.token, '/api/workspace', 'PUT', document)).status,
    200,
  )
  assert.equal(
    (
      await fetch(origin + '/api/workspace', {
        headers: {
          Authorization: 'Bearer ' + viewer.token,
          'x-workspace-id': privateStudio.id,
        },
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await call(viewer.token, '/api/guest-links', 'POST', {
        name: 'Escalate',
        minutes: 60,
        role: 'member',
      })
    ).status,
    403,
  )
  assert.equal(
    (await call(owner.token, '/api/guest-links/' + view.id, 'DELETE')).status,
    204,
  )
  assert.equal(store.identity.redeemGuest(view.token, 'Late'), null)
  assert.equal((await call(viewer.token, '/api/session')).status, 401)
  assert.equal(await store.access.role(viewer.profile.id, 'default'), null)
  assert.equal((await call(another.token, '/api/workspace')).status, 200)
  assert.equal((await call(editor.token, '/api/workspace')).status, 200)
  const db = new DatabaseSync(file)
  db.prepare('UPDATE guest_links SET expires_at=? WHERE id=?').run(
    Date.now() - 1,
    secondView.id,
  )
  db.close()
  assert.equal((await call(another.token, '/api/session')).status, 401)
  assert.equal(await store.access.role(another.profile.id, 'default'), null)
  assert.equal((await call(editor.token, '/api/workspace')).status, 200)
  const future = Date.now() + 31 * 86400000
  t.mock.method(Date, 'now', () => future)
  assert.equal(store.identity.authenticate(editor.token), undefined)
  const returning = store.identity.redeemGuest(edit.token, 'Returning guest')!
  assert.ok(returning)
  assert.equal(returning.profile.guestExpiresAt, guestLinkNoExpiry)
  assert.equal(
    await store.access.role(returning.profile.id, 'default'),
    'guest',
  )
  await store.guests.revoke(edit.id, 'default')
  assert.equal(store.identity.authenticate(returning.token), undefined)
  assert.equal(store.identity.redeemGuest(edit.token, 'Revoked'), null)
})

test('legacy guest links keep editing permissions after adding per-link roles', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aril-link-migration-'))
  const file = join(dir, 'fixture.sqlite')
  let store = openStore(file)
  try {
    const owner = store.identity.bootstrap()!
    const legacy = await store.guests.create(
      owner.profile.id,
      'default',
      'Legacy editing',
      60,
    )
    const existingGuest = store.identity.redeemGuest(
      legacy.token,
      'Existing guest',
    )!
    // Reopen an old-format table through the additive migration.
    const db = new DatabaseSync(file)
    db.exec('ALTER TABLE guest_links DROP COLUMN role')
    db.close()
    store.close()
    store = openStore(file)
    assert.ok(store.identity.authenticate(owner.token))
    assert.ok(store.identity.authenticate(existingGuest.token))
    assert.equal((await store.guests.list('default'))[0].role, 'member')
    assert.equal(
      await store.access.role(existingGuest.profile.id, 'default'),
      'guest',
    )
    const check = new DatabaseSync(file)
    assert.equal(
      check
        .prepare('PRAGMA table_info(guest_links)')
        .all()
        .some((column) => column.name === 'role'),
      true,
    )
    assert.equal(store.studios(owner.profile.id)[0].id, 'default')
    check.close()
  } finally {
    store.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
