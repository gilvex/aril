import { z } from 'zod'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { exportJWK, generateKeyPair, SignJWT } from 'jose'
import { createApp } from './app.ts'
import { identityStore } from './identity.ts'

test('legacy Google accounts migrate atomically and provider identities remain isolated', () => {
  const db = new DatabaseSync(':memory:')
  db.exec(`CREATE TABLE profiles (id TEXT PRIMARY KEY,name TEXT NOT NULL,avatar TEXT NOT NULL,color TEXT NOT NULL);
    CREATE TABLE accounts (subject TEXT PRIMARY KEY,user_id TEXT NOT NULL UNIQUE,email TEXT NOT NULL);
    INSERT INTO profiles VALUES ('legacy','Existing owner','','red');
    INSERT INTO accounts VALUES ('shared-subject','legacy','owner@example.test');`)
  try {
    const identity = identityStore(db)
    assert.equal(identity.signInGoogle('shared-subject')?.profile.id, 'legacy')
    const yandex = identity.registerAccount(
      'yandex',
      'https://login.yandex.ru',
      'shared-subject',
      'owner@example.test',
      'Yandex',
    )
    assert.notEqual(yandex.profile.id, 'legacy')
    assert.equal(
      identity.linkAccount(
        'legacy',
        'yandex',
        'https://login.yandex.ru',
        'shared-subject',
        'owner@example.test',
      ),
      false,
    )
    assert.equal(
      identity.linkAccount(
        'legacy',
        'oidc',
        'https://id.example.test',
        'shared-subject',
        '',
      ),
      true,
    )
    assert.equal(identity.accounts('legacy').length, 2)
    const otherIssuer = identity.registerAccount(
      'oidc',
      'https://other.example.test',
      'shared-subject',
      'owner@example.test',
      'Other',
    )
    assert.notEqual(otherIssuer.profile.id, 'legacy')
    assert.equal(
      identityStore(db).signInGoogle('shared-subject')?.profile.id,
      'legacy',
    )
    assert.equal(
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM sqlite_master WHERE name='yandex_accounts'",
        )
        .get()!.count,
      0,
    )
  } finally {
    db.close()
  }
})

test('Yandex and OIDC: browser-bound one-use flows, invitation gating, linking and token validation', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'aril-federated-'))
  const keys = [
    'GOOGLE_CLIENT_ID',
    'YANDEX_CLIENT_ID',
    'YANDEX_CLIENT_SECRET',
    'OIDC_ISSUER',
    'OIDC_CLIENT_ID',
    'OIDC_CLIENT_SECRET',
  ]
  const previous = new Map(keys.map((key) => [key, process.env[key]]))
  const { publicKey, privateKey } = await generateKeyPair('RS256')
  const jwk = {
    ...(await exportJWK(publicKey)),
    kid: 'fixture',
    alg: 'RS256',
    use: 'sig',
  }
  let nonce = '',
    mode = 'valid',
    issuer = ''
  const idp = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (req.url === '/.well-known/openid-configuration') {
      res.end(
        JSON.stringify({
          issuer,
          authorization_endpoint: issuer + '/authorize?tenant=fixture',
          token_endpoint: issuer + '/token',
          jwks_uri: issuer + '/jwks',
        }),
      )
      return
    }
    if (req.url === '/jwks') {
      res.end(JSON.stringify({ keys: [jwk] }))
      return
    }
    if (req.url === '/token') {
      let text = ''
      for await (const chunk of req) text += chunk
      const body = new URLSearchParams(text)
      assert.equal(
        req.headers.authorization,
        'Basic ' +
          Buffer.from('fixture-client:fixture-secret').toString('base64'),
      )
      assert.equal(body.get('grant_type'), 'authorization_code')
      assert.equal(
        createHash('sha256')
          .update('oidc:' + body.get('code_verifier'))
          .digest('base64url'),
        nonce,
      )
      const token = await new SignJWT({
        nonce: mode === 'nonce' ? 'wrong' : nonce,
        email: 'sso@example.test',
        email_verified: true,
        name: 'SSO fixture',
        ...(mode === 'azp' ? { azp: 'wrong' } : {}),
      })
        .setProtectedHeader({ alg: 'RS256', kid: 'fixture' })
        .setSubject('shared-subject')
        .setIssuer(mode === 'issuer' ? 'https://wrong.example.test' : issuer)
        .setAudience(mode === 'audience' ? 'wrong' : 'fixture-client')
        .setIssuedAt()
        .setExpirationTime(mode === 'expired' ? '0s' : '5m')
        .sign(privateKey)
      res.end(
        JSON.stringify({
          id_token:
            mode === 'signature' ? token.slice(0, -8) + 'AAAAAAAA' : token,
        }),
      )
      return
    }
    res.statusCode = 404
    res.end('{}')
  })
  idp.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => idp.once('listening', resolve))
  issuer = `http://127.0.0.1:${(idp.address() as { port: number }).port}`
  delete process.env.GOOGLE_CLIENT_ID
  Object.assign(process.env, {
    YANDEX_CLIENT_ID: 'fixture-yandex',
    YANDEX_CLIENT_SECRET: 'fixture-secret',
    OIDC_ISSUER: issuer,
    OIDC_CLIENT_ID: 'fixture-client',
    OIDC_CLIENT_SECRET: 'fixture-secret',
  })
  const { app, store, collaboration } = createApp(
    join(directory, 'fixture.sqlite'),
    'http://localhost:4317',
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const originalFetch = globalThis.fetch
  let yandexCalls = 0
  t.mock.method(
    globalThis,
    'fetch',
    async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
      const url = String(input)
      if (url === 'https://oauth.yandex.ru/token') {
        yandexCalls++
        assert.equal(
          new URLSearchParams(init?.body as URLSearchParams).get(
            'client_secret',
          ),
          'fixture-secret',
        )
        return Response.json({ access_token: 'fixture-token' })
      }
      if (url.startsWith('https://login.yandex.ru/info')) {
        assert.equal(
          (init?.headers as Record<string, string>).Authorization,
          'OAuth fixture-token',
        )
        return Response.json({
          id: 'shared-subject',
          default_email: 'yandex@example.test',
          display_name: 'Yandex fixture',
        })
      }
      return originalFetch(input, init)
    },
  )
  const call = (path: string, body?: unknown, token = '') =>
    fetch(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pomegranate-auth': '1',
        Authorization: 'Bearer ' + token,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  const start = async (provider: string, token = '') => {
    const response = await call(
      `/api/auth/${provider}/start`,
      { link: !!token, returnTo: '/#invite=fixture' },
      token,
    )
    assert.equal(response.status, 200)
    const url = new URL(
      z.object({ url: z.string() }).parse(await response.json()).url,
    )
    const cookie = response.headers.getSetCookie()[0].split(';')[0]
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256')
    if (provider === 'oidc') {
      assert.equal(url.searchParams.get('tenant'), 'fixture')
      nonce = url.searchParams.get('nonce')!
    }
    return { cookie, state: url.searchParams.get('state')! }
  }
  const callback = (
    provider: string,
    flow: { cookie: string; state: string },
    extra = '',
  ) =>
    fetch(
      `${base}/api/auth/${provider}/callback?code=fixture&state=${flow.state}${extra}`,
      { headers: { Cookie: flow.cookie }, redirect: 'manual' },
    )
  try {
    const config = z
      .object({
        googleClientId: z.string().nullable(),
        yandexEnabled: z.boolean(),
        oidcEnabled: z.boolean(),
      })
      .parse(await (await call('/api/auth/config')).json())
    assert.equal(config.googleClientId, null)
    assert.equal(config.yandexEnabled, true)
    assert.equal(config.oidcEnabled, true)
    assert.equal(JSON.stringify(config).includes('fixture-secret'), false)
    const owner = store.identity.bootstrap()!
    const flow = await start('yandex')
    const bad = await callback('yandex', { ...flow, state: 'wrong' })
    assert.match(bad.headers.get('location')!, /authError=yandex/)
    assert.equal(yandexCalls, 0)
    const response = await callback('yandex', flow)
    assert.equal(
      response.headers.get('location'),
      'http://localhost:4317/#invite=fixture',
    )
    const session = response.headers
      .getSetCookie()
      .find((value) => value.startsWith('pomegranate_session='))!
      .split(';')[0]
    const profile = z
      .object({
        profile: z.object({ id: z.string() }),
        accountLinked: z.boolean(),
        inviteRequired: z.boolean(),
      })
      .parse(
        await (
          await fetch(base + '/api/session', { headers: { Cookie: session } })
        ).json(),
      )
    assert.equal(profile.accountLinked, true)
    assert.equal(profile.inviteRequired, false)
    assert.deepEqual(store.studios(profile.profile.id), [])
    const token = session.split('=')[1]
    const invite = store.identity.invite(owner.profile.id)
    assert.equal(
      (await call('/api/join', { token: invite.token }, token)).status,
      200,
    )
    assert.match(
      (await callback('yandex', flow)).headers.get('location')!,
      /authError=yandex/,
    )
    assert.equal(yandexCalls, 1)
    const linked = await callback('oidc', await start('oidc', token))
    assert.equal(
      linked.headers.get('location'),
      'http://localhost:4317/#invite=fixture',
    )
    assert.equal(store.identity.accounts(profile.profile.id).length, 2)
    const signedIn = await callback('oidc', await start('oidc'))
    const restoredCookie = signedIn.headers
      .getSetCookie()
      .find((value) => value.startsWith('pomegranate_session='))!
      .split(';')[0]
    const restored = z.object({ profile: z.object({ id: z.string() }) }).parse(
      await (
        await fetch(base + '/api/session', {
          headers: { Cookie: restoredCookie },
        })
      ).json(),
    )
    assert.equal(restored.profile.id, profile.profile.id)
    for (mode of [
      'nonce',
      'issuer',
      'audience',
      'expired',
      'signature',
      'azp',
    ]) {
      const rejected = await callback('oidc', await start('oidc'))
      assert.match(rejected.headers.get('location')!, /authError=oidc/, mode)
      assert.equal(
        rejected.headers
          .getSetCookie()
          .some((value) => value.startsWith('pomegranate_session=')),
        false,
      )
    }
    mode = 'valid'
    const deniedFlow = await start('oidc')
    const denied = await callback('oidc', deniedFlow, '&error=access_denied')
    const deniedTarget = new URL(denied.headers.get('location')!)
    assert.equal(deniedTarget.hash, '#invite=fixture')
    assert.equal(deniedTarget.searchParams.get('authError'), 'oidc')
    assert.equal(store.identity.consumeChallenge(deniedFlow.state), undefined)
    const collision = await callback(
      'yandex',
      await start('yandex', owner.token),
    )
    assert.match(collision.headers.get('location')!, /authError=yandex/)
    assert.equal(store.identity.accounts(owner.profile.id).length, 0)
    const guestLink = await store.guests.create(
      owner.profile.id,
      'default',
      'Fixture guest',
      1,
    )
    const guest = store.identity.redeemGuest(guestLink.token, 'Guest')!
    assert.equal(
      (await call('/api/auth/oidc/start', { link: true }, guest.token)).status,
      403,
    )
    const expired = await start('yandex')
    assert.ok(store.identity.consumeChallenge(expired.state))
    assert.match(
      (await callback('yandex', expired)).headers.get('location')!,
      /authError=yandex/,
    )
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    collaboration.close()
    server.closeAllConnections()
    idp.closeAllConnections()
    await Promise.all([
      new Promise<void>((resolve) => server.close(() => resolve())),
      new Promise<void>((resolve) => idp.close(() => resolve())),
    ])
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})
