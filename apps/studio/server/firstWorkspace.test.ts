import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { z } from 'zod'
import { createApp } from './app.ts'

test('new Google, Yandex and SSO accounts create isolated owned workspaces without invitations', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'aril-first-workspace-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'fixture.sqlite'),
  )
  const owner = store.identity.bootstrap()!
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const call = (
    path: string,
    token: string,
    body?: unknown,
    workspace = 'default',
  ) =>
    fetch(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        'x-workspace-id': workspace,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  try {
    assert.equal(
      (await call('/api/studios', '', { name: 'Anonymous' })).status,
      401,
    )
    for (const provider of ['google', 'yandex', 'oidc']) {
      const user = store.identity.registerAccount(
        provider,
        'https://id.example.test',
        provider,
        'fixture@example.test',
        'Fixture',
      )
      assert.deepEqual(store.studios(user.profile.id), [])
      const session = z
        .object({ inviteRequired: z.boolean() })
        .parse(await (await call('/api/session', user.token)).json())
      assert.equal(session.inviteRequired, false)
      assert.equal((await call('/api/workspace', user.token)).status, 403)
      assert.equal(
        (await call('/api/studios', user.token, { name: ' ' })).status,
        400,
      )
      const response = await call('/api/studios', user.token, {
        name: 'My project',
      })
      assert.equal(response.status, 201)
      const created = z
        .object({ id: z.string(), role: z.literal('owner') })
        .parse(await response.json())
      assert.equal(
        await store.access.role(user.profile.id, created.id),
        'owner',
      )
      assert.equal(await store.access.role(owner.profile.id, created.id), null)
      assert.equal(
        (await call('/api/workspace', user.token, undefined, created.id))
          .status,
        200,
      )
      assert.equal(
        (await call('/api/workspace', owner.token, undefined, created.id))
          .status,
        403,
      )
      assert.equal((await call('/api/workspace', user.token)).status, 403)
      assert.equal(store.studios(user.profile.id).length, 1)
    }
    const link = await store.guests.create(
      owner.profile.id,
      'default',
      'Guest',
      60,
    )
    const guest = store.identity.redeemGuest(link.token, 'Guest')!
    assert.equal(
      (await call('/api/studios', guest.token, { name: 'Guest project' }))
        .status,
      403,
    )
    assert.equal(store.studios(owner.profile.id).length, 1)
  } finally {
    collaboration.close()
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})
