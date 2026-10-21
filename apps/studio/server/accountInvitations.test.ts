import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openStore } from './store.ts'
import { createApplication } from './app.ts'
import { sendInvitationEmail } from './utils/sendInvitationEmail.ts'

test('targeted invitations: recipient binding, accept/decline, future accounts, usernames and owner revocation', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aril-invitations-')),
    store = openStore(join(dir, 'test.sqlite'))
  try {
    const owner = store.identity.bootstrap()!
    store.identity.linkGoogle(owner.profile.id, 'owner', 'owner@example.test')
    const recipient = store.identity.registerGoogle(
      'recipient',
      'recipient@example.test',
      'Recipient',
    )
    const other = store.identity.registerGoogle(
      'other',
      'other@example.test',
      'Other',
    )
    assert.match(recipient.profile.username!, /^user_/)
    assert.equal(
      await store.invitations.setUsername(recipient.profile.id, 'designer'),
      true,
    )
    assert.equal(
      await store.invitations.setUsername(other.profile.id, 'designer'),
      false,
    )
    assert.equal(
      await store.invitations.setUsername(other.profile.id, 'user_reserved'),
      false,
    )
    assert.equal(
      await store.invitations.setUsername(other.profile.id, 'bad spaces'),
      false,
    )
    assert.equal(
      store.identity.profile(recipient.profile.id)!.username,
      'designer',
    )
    const found = await store.invitations.search('des')
    assert.equal(found[0].id, recipient.profile.id)
    assert.equal('email' in found[0], false)
    assert.equal((await store.invitations.search('recipient@')).length, 0)
    assert.equal(
      (await store.invitations.search('recipient@example.test')).length,
      1,
    )
    assert.equal((await store.invitations.search('%')).length, 0)
    assert.equal(
      await store.invitations.create(
        other.profile.id,
        'default',
        'recipient@example.test',
        null,
        'member',
      ),
      null,
    )
    const id = (await store.invitations.create(
      owner.profile.id,
      'default',
      'recipient@example.test',
      null,
      'viewer',
    ))!
    assert.equal(await store.invitations.accept(other.profile.id, id), null)
    assert.equal((await store.invitations.list(other.profile.id)).length, 0)
    assert.equal(
      (await store.invitations.list(recipient.profile.id))[0].role,
      'viewer',
    )
    assert.equal(
      await store.invitations.accept(recipient.profile.id, id),
      'default',
    )
    assert.equal(
      await store.access.role(recipient.profile.id, 'default'),
      'viewer',
    )
    assert.equal(await store.invitations.accept(recipient.profile.id, id), null)
    assert.equal(
      await store.invitations.decline(recipient.profile.id, id),
      false,
    )
    const future = (await store.invitations.create(
      owner.profile.id,
      'default',
      'future@example.test',
      null,
      'member',
    ))!
    const newUser = store.identity.registerGoogle(
      'future',
      'Future@example.test',
      'Future',
    )
    assert.equal(
      (await store.invitations.list(newUser.profile.id))[0].id,
      future,
    )
    assert.equal(
      await store.invitations.decline(newUser.profile.id, future),
      true,
    )
    assert.equal(
      await store.invitations.accept(newUser.profile.id, future),
      null,
    )
    const removal = store.createStudio(owner.profile.id, 'Removal fixture')
    const join = store.identity.invite(owner.profile.id, removal.id)
    store.identity.join(
      join.token,
      recipient.profile.name,
      recipient.profile.id,
    )
    const pending = (await store.invitations.create(
      owner.profile.id,
      removal.id,
      'recipient@example.test',
      null,
      'member',
    ))!
    assert.equal(
      await store.access.remove(
        owner.profile.id,
        removal.id,
        recipient.profile.id,
      ),
      true,
    )
    assert.equal(
      await store.invitations.accept(recipient.profile.id, pending),
      null,
    )
    const workspace = store.createStudio(owner.profile.id, 'Secondary')
    const revoked = (await store.invitations.create(
      owner.profile.id,
      workspace.id,
      'other@example.test',
      other.profile.id,
      'member',
    ))!
    assert.equal(
      store.deleteStudio(owner.profile.id, workspace.id, 'Secondary'),
      true,
    )
    assert.equal(
      await store.invitations.accept(other.profile.id, revoked),
      null,
    )
  } finally {
    store.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('invitation API requires linked accounts and ownership; targeted link cannot be redeemed by another user', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aril-invitation-api-')),
    store = openStore(join(dir, 'test.sqlite'))
  const application = createApplication(store),
    server = application.app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const owner = store.identity.bootstrap()!,
    recipient = store.identity.registerGoogle(
      'recipient',
      'recipient@example.test',
      'Recipient',
    )
  const request = (token: string, path: string, body?: unknown) =>
    fetch(url + path, {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  try {
    assert.equal((await request(owner.token, '/api/notifications')).status, 403)
    store.identity.linkGoogle(owner.profile.id, 'owner', 'owner@example.test')
    assert.equal(
      (
        await request(recipient.token, '/api/account-invitations', {
          email: 'victim@example.test',
          role: 'member',
        })
      ).status,
      403,
    )
    assert.equal(
      (await request(recipient.token, '/api/directory?q=owner')).status,
      403,
    )
    const response = await request(owner.token, '/api/account-invitations', {
      email: 'recipient@example.test',
      role: 'viewer',
    })
    assert.equal(response.status, 201)
    const result = (await response.json()) as { id: string; delivery: string }
    assert.equal(result.delivery, 'unconfigured')
    assert.equal(
      (await request(owner.token, '/api/join', { token: result.id })).status,
      403,
    )
    assert.equal(
      (await request(recipient.token, '/api/join', { token: result.id }))
        .status,
      200,
    )
    assert.equal(
      await store.access.role(recipient.profile.id, 'default'),
      'viewer',
    )
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('Resend transport reports failures and sends only the intended recipient with an idempotency key', async () => {
  const previousFetch = globalThis.fetch,
    oldKey = process.env.RESEND_API_KEY,
    oldFrom = process.env.ARIL_EMAIL_FROM
  process.env.RESEND_API_KEY = 'fixture-key'
  process.env.ARIL_EMAIL_FROM = 'Aril <invites@example.test>'
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, 'https://api.resend.com/emails')
      const body = JSON.parse(String(init?.body))
      assert.deepEqual(body.to, ['recipient@example.test'])
      assert.match(body.text, /https:\/\/aril.example\/app#invite=fixture-id/)
      assert.equal(
        (init?.headers as Record<string, string>)['Idempotency-Key'],
        'invitation/fixture-id',
      )
      return new Response('{}', { status: 200 })
    }
    assert.equal(
      await sendInvitationEmail(
        'fixture-id',
        'recipient@example.test',
        'Demo',
        'Owner',
        'https://aril.example',
      ),
      'sent',
    )
    globalThis.fetch = async () => new Response('{}', { status: 429 })
    assert.equal(
      await sendInvitationEmail(
        'fixture-id',
        'recipient@example.test',
        'Demo',
        'Owner',
        'https://aril.example',
      ),
      'failed',
    )
    globalThis.fetch = async () => {
      throw new Error('timeout')
    }
    assert.equal(
      await sendInvitationEmail(
        'fixture-id',
        'recipient@example.test',
        'Demo',
        'Owner',
        'https://aril.example',
      ),
      'failed',
    )
  } finally {
    globalThis.fetch = previousFetch
    if (oldKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = oldKey
    if (oldFrom === undefined) delete process.env.ARIL_EMAIL_FROM
    else process.env.ARIL_EMAIL_FROM = oldFrom
  }
})
