import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { OAuth2Client, LoginTicket } from 'google-auth-library'
import { createApp } from './app.ts'

test('Google-first onboarding preserves invitations, gates access and restores the same account', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'aril-google-first-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'test.sqlite'),
  )
  const owner = store.identity.bootstrap()!
  const invite = store.identity.invite(owner.profile.id)
  const oldClientId = process.env.GOOGLE_CLIENT_ID
  process.env.GOOGLE_CLIENT_ID = 'fixture-client'
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const call = (path: string, token = '', body?: unknown) =>
    fetch(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-pomegranate-auth': '1',
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  let nonce = ''
  t.mock.method(
    OAuth2Client.prototype,
    'verifyIdToken',
    async () =>
      new LoginTicket('', {
        sub: 'google-new-user',
        email: 'new@example.test',
        email_verified: true,
        name: 'New Person',
        iss: 'https://accounts.google.com',
        aud: 'fixture-client',
        iat: 1,
        exp: 9999999999,
        nonce,
      } as NonNullable<ReturnType<LoginTicket['getPayload']>>),
  )
  const signIn = async () => {
    const challenge = (await (
      await call('/api/auth/google/challenge', '', {})
    ).json()) as { nonce: string; challenge: string }
    nonce = challenge.nonce
    const response = await call('/api/auth/google', '', {
      credential: 'verified-by-test-double',
      challenge: challenge.challenge,
      link: false,
    })
    assert.equal(response.status, 200)
    assert.equal(
      (
        await call('/api/auth/google', '', {
          credential: 'replay',
          challenge: challenge.challenge,
          link: false,
        })
      ).status,
      401,
    )
    return response.json() as Promise<{
      profile: { id: string; name: string }
      token: string
    }>
  }
  try {
    assert.equal(
      (
        await call('/api/join', '', {
          token: invite.token,
          name: 'Guest bypass',
        })
      ).status,
      401,
    )
    assert.equal(
      (await call('/api/join', owner.token, { token: invite.token })).status,
      401,
    )
    const user = await signIn()
    assert.equal(user.profile.name, 'New Person')
    assert.deepEqual(await (await call('/api/studios', user.token)).json(), [])
    assert.equal((await call('/api/workspace', user.token)).status, 403)
    assert.equal(
      (await call('/api/studios', user.token, { name: 'Bypass invitation' }))
        .status,
      403,
    )
    assert.equal(
      (
        (await (await call('/api/session', user.token)).json()) as {
          inviteRequired: boolean
        }
      ).inviteRequired,
      true,
    )
    assert.equal(
      (
        await call('/api/join', user.token, {
          token: 'invalid-invitation-token',
        })
      ).status,
      403,
    )
    const joined = await call('/api/join', user.token, {
      token: invite.token,
      name: 'Ignored name',
    })
    assert.equal(joined.status, 200)
    assert.equal(
      ((await joined.json()) as { profile: { id: string } }).profile.id,
      user.profile.id,
    )
    assert.equal(store.identity.profile(user.profile.id)?.name, 'New Person')
    assert.equal(
      (await call('/api/join', user.token, { token: invite.token })).status,
      403,
    )
    assert.equal((await call('/api/workspace', user.token)).status, 200)
    assert.equal(
      (
        (await (await call('/api/session', user.token)).json()) as {
          inviteRequired: boolean
        }
      ).inviteRequired,
      false,
    )
    const again = await signIn()
    assert.equal(again.profile.id, user.profile.id)
    assert.equal(store.identity.count(), 2)
    assert.equal((await call('/api/workspace', again.token)).status, 200)
    const sameEmail = store.identity.registerGoogle(
      'different-subject',
      'new@example.test',
      'Another Person',
    )
    assert.notEqual(sameEmail.profile.id, user.profile.id)
    assert.deepEqual(store.studios(sameEmail.profile.id), [])
  } finally {
    if (oldClientId === undefined) delete process.env.GOOGLE_CLIENT_ID
    else process.env.GOOGLE_CLIENT_ID = oldClientId
    collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})
