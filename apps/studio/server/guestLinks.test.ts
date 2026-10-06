import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createApp } from './app.ts'
import { openPostgres } from './postgres.ts'
import { createLiveSession } from './liveSession.ts'

test('guest links grant scoped temporary editing without Google; revocation ends all redeemed sessions', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'aril-guests-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'test.sqlite'),
  )
  const owner = store.identity.bootstrap()!
  const privateStudio = store.createStudio(owner.profile.id, 'Private')
  const outsider = store.identity.registerGoogle(
    'outsider',
    'outside@example.test',
    'Outsider',
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const call = (
    path: string,
    token = '',
    method = 'GET',
    body?: unknown,
    workspaceId = 'default',
  ) =>
    fetch(url + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-pomegranate-auth': '1',
        'x-workspace-id': workspaceId,
        'x-pomegranate-write-version': '2',
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  t.after(async () => {
    collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  })
  assert.equal(
    (
      await call('/api/guest-links', '', 'POST', {
        name: 'Review',
        minutes: 60,
      })
    ).status,
    401,
  )
  assert.equal(
    (
      await call('/api/guest-links', outsider.token, 'POST', {
        name: 'Review',
        minutes: 60,
      })
    ).status,
    403,
  )
  for (const minutes of [0, 4, 43201, 5.5])
    assert.equal(
      (
        await call('/api/guest-links', owner.token, 'POST', {
          name: 'Review',
          minutes,
        })
      ).status,
      400,
    )
  const response = await call('/api/guest-links', owner.token, 'POST', {
    name: 'Review',
    minutes: 60,
  })
  assert.equal(response.status, 201)
  const link = (await response.json()) as {
    token: string
    id: string
    expiresAt: number
  }
  const visitors = []
  for (const name of ['Guest one', 'Guest two']) {
    const joined = await call('/api/auth/guest', '', 'POST', {
      token: link.token,
      name,
    })
    assert.equal(joined.status, 201)
    const guest = (await joined.json()) as {
      token: string
      profile: { id: string; guestExpiresAt: number }
    }
    visitors.push(guest)
    assert.equal(guest.profile.guestExpiresAt, link.expiresAt)
    assert.equal((await call('/api/workspace', guest.token)).status, 200)
    assert.equal(
      (
        await call(
          '/api/workspace',
          guest.token,
          'GET',
          undefined,
          privateStudio.id,
        )
      ).status,
      403,
    )
    const document = (await (
      await call('/api/workspace', guest.token)
    ).json()) as { revision: number; workspace: Record<string, unknown> }
    assert.equal(
      (await call('/api/workspace', guest.token, 'PUT', document)).status,
      200,
    )
    for (const path of [
      '/api/invites',
      '/api/guest-links',
      '/api/agent-access',
      '/api/studios',
      '/api/hosted-access',
    ]) {
      assert.equal(
        (await call(path, guest.token, 'POST', { name: 'Bypass', minutes: 60 }))
          .status,
        403,
        path,
      )
    }
    assert.equal(
      store.identity.linkGoogle(
        guest.profile.id,
        'guest-subject',
        'guest@example.test',
      ),
      false,
    )
    const invite = store.identity.invite(owner.profile.id)
    assert.equal(
      (await call('/api/join', guest.token, 'POST', { token: invite.token }))
        .status,
      401,
    )
  }
  const listed = (await (
    await call('/api/guest-links', owner.token)
  ).json()) as { id: string; guests: number; token?: string }[]
  assert.equal(listed[0].guests, 2)
  assert.equal(listed[0].token, undefined)
  await call(
    `/api/guest-links/${link.id}`,
    owner.token,
    'DELETE',
    undefined,
    privateStudio.id,
  )
  assert.equal(
    (await call('/api/session', visitors[0].token)).status,
    200,
    'Wrong workspace cannot revoke a link',
  )
  assert.equal(
    (await call(`/api/guest-links/${link.id}`, owner.token, 'DELETE')).status,
    204,
  )
  for (const guest of visitors) {
    for (const path of [
      '/api/session',
      '/api/workspace',
      '/api/history',
      '/api/studios',
    ])
      assert.equal((await call(path, guest.token)).status, 401, path)
    assert.equal(
      (await call('/api/workspace', guest.token, 'PUT', {})).status,
      401,
    )
    assert.equal(
      (await call('/api/realtime', guest.token, 'POST', {})).status,
      401,
    )
  }
  assert.equal(
    (
      await call('/api/auth/guest', '', 'POST', {
        token: link.token,
        name: 'Late visitor',
      })
    ).status,
    403,
  )
  assert.equal((await call('/api/workspace', owner.token)).status, 200)
  const expiring = await store.guests.create(
    owner.profile.id,
    'default',
    'Short visit',
    5,
  )
  const shortGuest = store.identity.redeemGuest(expiring.token, 'Short guest')!
  t.mock.method(Date, 'now', () => expiring.expiresAt + 1)
  assert.equal(store.identity.authenticate(shortGuest.token), undefined)
  assert.equal(store.identity.redeemGuest(expiring.token, 'Too late'), null)
  assert.ok(store.identity.authenticate(owner.token))
})

test('guest live credentials cannot outlast link expiry and refresh on a short interval', (t) => {
  const values = {
    SUPABASE_JWT_SECRET: 'guest-fixture-secret',
    SUPABASE_URL: 'https://fixture.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'fixture-key',
  }
  for (const [key, value] of Object.entries(values)) {
    const old = process.env[key]
    process.env[key] = value
    t.after(() => {
      if (old === undefined) delete process.env[key]
      else process.env[key] = old
    })
  }
  const expiry = Date.now() + 20000
  const config = createLiveSession(
    'default',
    {
      id: 'guest',
      name: 'Guest',
      color: '#123456',
      avatar: '',
      guestExpiresAt: expiry,
    },
    'client',
    'key',
  )
  const claims = JSON.parse(
    Buffer.from(config.token.split('.')[1], 'base64url').toString(),
  )
  assert.ok(claims.exp * 1000 <= expiry)
  assert.equal(JSON.parse(config.certificate.body).expiresAt, expiry)
  assert.equal(config.refreshAfterMs, 15000)
})

test(
  'Postgres guest links share expiry and revocation across instances',
  { skip: !process.env.POSTGRES_TEST_URL },
  async () => {
    const schema = 'aril_guest_test_' + Date.now()
    const a = await openPostgres(process.env.POSTGRES_TEST_URL!, schema)
    const b = await openPostgres(process.env.POSTGRES_TEST_URL!, schema)
    try {
      const owner = (await a.identity.bootstrap())!
      const link = await a.guests.create(
        owner.profile.id,
        'default',
        'Review',
        60,
      )
      const guest = (await b.identity.redeemGuest(link.token, 'Guest'))!
      assert.equal(
        (await a.identity.authenticate(guest.token))?.guestExpiresAt,
        link.expiresAt,
      )
      assert.equal(
        await b.identity.linkGoogle(
          guest.profile.id,
          'guest-google',
          'guest@example.test',
        ),
        false,
      )
      await a.guests.revoke(link.id, 'default')
      assert.equal(await b.identity.authenticate(guest.token), undefined)
      assert.equal(await b.identity.redeemGuest(link.token, 'Late'), null)
      const expired = await a.guests.create(
        owner.profile.id,
        'default',
        'Expired',
        5,
      )
      const visitor = (await b.identity.redeemGuest(
        expired.token,
        'Short visit',
      ))!
      await a.query('UPDATE studio.guest_links SET expires_at=$1 WHERE id=$2', [
        Date.now() - 1,
        expired.id,
      ])
      assert.equal(await b.identity.authenticate(visitor.token), undefined)
    } finally {
      await b.close()
      await a.query(`DROP SCHEMA ${schema} CASCADE`)
      await a.close()
    }
  },
)
