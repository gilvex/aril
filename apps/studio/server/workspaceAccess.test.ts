import { writeVersion } from '@pomegranate/domain/freshness'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createApp } from './app.ts'

test('only owners manage access; live role changes protect browser and agent writes and removal ends access', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'aril-access-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'fixture.sqlite'),
  )
  const owner = store.identity.bootstrap()!
  const invitation = store.identity.invite(owner.profile.id)
  const editor = store.identity.join(invitation.token, 'Editor')!
  const other = store.createStudio(owner.profile.id, 'Other file')
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  t.after(async () => {
    collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  })
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const call = (
    token: string,
    path: string,
    method = 'GET',
    body?: unknown,
    workspace = 'default',
  ) =>
    fetch(url + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-workspace-id': workspace,
        'Content-Type': 'application/json',
        'x-pomegranate-write-version': writeVersion,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  assert.equal((await call(editor.token, '/api/members')).status, 200)
  assert.equal(
    (await call(editor.token, '/api/members', 'GET', undefined, other.id))
      .status,
    403,
  )
  assert.equal(
    (await call(editor.token, `/api/members/${owner.profile.id}`, 'DELETE'))
      .status,
    403,
  )
  assert.equal(
    (await call(owner.token, `/api/members/${owner.profile.id}`, 'DELETE'))
      .status,
    409,
  )
  assert.equal(
    (
      await call(owner.token, `/api/members/${owner.profile.id}`, 'PATCH', {
        role: 'viewer',
      })
    ).status,
    409,
  )
  assert.equal((await call(editor.token, '/api/invites', 'POST')).status, 403)
  const credentialResponse = await call(
    editor.token,
    '/api/agent-access',
    'POST',
    { name: 'Fixture agent', scope: 'write', days: 30 },
  )
  assert.equal(credentialResponse.status, 201)
  const credential = (await credentialResponse.json()) as { token: string }
  const current = store.read()
  const edit = {
    baseRevision: current.revision,
    requestId: randomUUID(),
    operations: [
      {
        path: ['notesTitle'],
        before: current.workspace.notesTitle,
        after: 'Changed',
      },
    ],
  }
  assert.equal(
    (
      await call(owner.token, `/api/members/${editor.profile.id}`, 'PATCH', {
        role: 'viewer',
      })
    ).status,
    200,
  )
  assert.equal(
    (
      (await call(editor.token, '/api/workspace-access').then((r) =>
        r.json(),
      )) as { role: string }
    ).role,
    'viewer',
  )
  assert.equal((await call(editor.token, '/api/workspace')).status, 200)
  assert.equal(
    (await call(editor.token, '/api/workspace', 'PATCH', edit)).status,
    403,
  )
  assert.equal(
    (
      await call(editor.token, '/api/workspace', 'PUT', {
        baseRevision: current.revision,
        workspace: current.workspace,
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await call(editor.token, '/api/agent-access', 'POST', {
        name: 'Forbidden',
        scope: 'write',
        days: 30,
      })
    ).status,
    403,
  )
  assert.equal(
    (await call(credential.token, '/api/agent/workspace', 'PATCH', edit))
      .status,
    403,
  )
  assert.equal(
    (await call(credential.token, '/api/agent/workspace')).status,
    200,
  )
  assert.throws(
    () =>
      store.save(
        current.workspace,
        current.revision,
        undefined,
        'default',
        editor.profile.id,
      ),
    /permission/,
  )
  assert.equal(store.read().revision, current.revision)
  assert.equal(
    (
      await call(owner.token, `/api/members/${editor.profile.id}`, 'PATCH', {
        role: 'member',
      })
    ).status,
    200,
  )
  assert.equal(
    (await call(editor.token, '/api/workspace', 'PATCH', edit)).status,
    200,
  )
  assert.equal(
    (await call(owner.token, `/api/members/${editor.profile.id}`, 'DELETE'))
      .status,
    204,
  )
  assert.equal((await call(editor.token, '/api/workspace')).status, 403)
  assert.equal((await call(editor.token, '/api/workspace-access')).status, 403)
  assert.equal(
    (await call(credential.token, '/api/agent/workspace')).status,
    401,
  )
  assert.equal(store.studios(editor.profile.id).length, 0)
  assert.equal(store.member(owner.profile.id, other.id), true)
})
