import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID, createHmac, type webcrypto } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApplication } from './app.ts'
import { openStore } from './store.ts'
import { createLiveSession } from './live-session.ts'
import {
  encode64,
  publicKey,
  signMessage,
  verifyCertificate,
  verifyMessage,
} from '@pomegranate/domain/live-session'

test('live credentials preserve membership, bind identity to a tab key, and reject old database presence writes', async (t) => {
  const env = [
    'SUPABASE_JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_PUBLISHABLE_KEY',
  ]
  const previous = env.map((key) => process.env[key])
  process.env.SUPABASE_JWT_SECRET = 'test-only-secret-never-used-in-production'
  process.env.SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test'
  t.after(() =>
    env.forEach((key, i) => {
      if (previous[i] === undefined) delete process.env[key]
      else process.env[key] = previous[i]
    }),
  )
  const directory = mkdtempSync(join(tmpdir(), 'pomegranate-live-'))
  const store = openStore(join(directory, 'studio.sqlite'))
  const owner = store.identity.bootstrap()!
  const invitation = store.identity.invite(owner.profile.id)
  const peer = store.identity.join(invitation.token, 'Peer')!
  const privateWorkspace = store.createStudio(owner.profile.id, 'Private')
  const cloud = {
    revision: async (workspaceId: string) => store.read(workspaceId).revision,
  }
  const application = createApplication({ ...store, cloud })
  const server = application.app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  t.after(async () => {
    application.collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  })
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const keys = (await crypto.subtle.generateKey('Ed25519', true, [
    'sign',
    'verify',
  ])) as webcrypto.CryptoKeyPair
  const clientId = randomUUID()
  const body = {
    clientId,
    publicKey: encode64(await crypto.subtle.exportKey('raw', keys.publicKey)),
  }
  const call = (
    token: string,
    workspace = 'default',
    path = '/api/realtime',
    data: unknown = body,
  ) =>
    fetch(url + path, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'x-workspace-id': workspace,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  assert.equal((await call('')).status, 401)
  assert.equal((await call(peer.token, privateWorkspace.id)).status, 403)
  assert.equal((await call(owner.token, 'missing-workspace')).status, 403)
  assert.equal(
    (
      await call(owner.token, 'default', '/api/realtime', {
        clientId,
        publicKey: 'invalid',
      })
    ).status,
    400,
  )
  const response = await call(owner.token)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  const config = (await response.json()) as ReturnType<typeof createLiveSession>
  const [header, claims, signature] = config.token.split('.')
  assert.equal(
    signature,
    createHmac('sha256', process.env.SUPABASE_JWT_SECRET!)
      .update(`${header}.${claims}`)
      .digest('base64url'),
  )
  const jwt = JSON.parse(Buffer.from(claims, 'base64url').toString())
  assert.equal(jwt.role, 'authenticated')
  assert.equal(jwt.pomegranate_topic, 'pomegranate:live:default')
  assert.equal(jwt.exp - jwt.iat, 300)
  const verifier = await publicKey(config.verificationKey)
  const identity = await verifyCertificate(
    config.certificate,
    verifier,
    'default',
  )
  assert.equal(identity?.profile.id, owner.profile.id)
  assert.equal(identity?.clientId, clientId)
  const realNow = Date.now()
  const clock = t.mock.method(Date, 'now', () => realNow + 6 * 60 * 1000)
  assert.equal(
    await verifyCertificate(config.certificate, verifier, 'default'),
    null,
  )
  clock.mock.restore()
  assert.equal(
    await verifyCertificate(config.certificate, verifier, privateWorkspace.id),
    null,
  )
  const forged = {
    ...config.certificate,
    body: config.certificate.body.replace(owner.profile.id, peer.profile.id),
  }
  assert.equal(await verifyCertificate(forged, verifier, 'default'), null)
  const packet = JSON.stringify({
    clientId,
    sequence: 5,
    cursor: { x: 123, y: 456 },
  })
  const signed = await signMessage(keys.privateKey, packet)
  const peerKey = await publicKey(identity!.publicKey)
  assert.ok(await verifyMessage(peerKey, packet, signed))
  assert.equal(
    await verifyMessage(peerKey, packet.replace('123', '999'), signed),
    false,
  )
  const attacker = (await crypto.subtle.generateKey('Ed25519', true, [
    'sign',
    'verify',
  ])) as webcrypto.CryptoKeyPair
  assert.equal(
    await verifyMessage(
      peerKey,
      packet,
      await signMessage(attacker.privateKey, packet),
    ),
    false,
  )
  const revision = store.read().revision
  assert.equal(
    (
      await call(owner.token, 'default', '/api/presence', {
        clientId,
        boardId: null,
        view: 'canvas',
        cursor: { x: 1, y: 2 },
        selected: [],
        sequence: 1,
      })
    ).status,
    428,
  )
  assert.equal(store.read().revision, revision)
  assert.equal('put' in cloud, false)
  // Separate invocations derive the same public verifier; private signing material never leaves the server.
  assert.equal(
    createLiveSession('default', owner.profile, clientId, body.publicKey)
      .verificationKey,
    config.verificationKey,
  )
})
