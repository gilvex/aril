import assert from 'node:assert/strict'
import { test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { openPostgres } from './postgres.ts'
test(
  'Postgres targeted invitations stay atomic across instances and migrate additively',
  { skip: !process.env.POSTGRES_TEST_URL },
  async () => {
    const schema = 'aril_invites_' + randomUUID().replaceAll('-', '')
    const a = await openPostgres(process.env.POSTGRES_TEST_URL!, schema)
    const b = await openPostgres(process.env.POSTGRES_TEST_URL!, schema)
    try {
      const owner = (await a.identity.bootstrap())!
      const user = await a.identity.registerGoogle(
        'fixture',
        'fixture@example.test',
        'Fixture',
      )
      const other = await a.identity.registerGoogle(
        'other',
        'other@example.test',
        'Other',
      )
      const id = (await a.invitations.create(
        owner.profile.id,
        'default',
        'fixture@example.test',
        null,
        'viewer',
      ))!
      assert.equal((await b.invitations.list(user.profile.id))[0].id, id)
      assert.equal(await b.invitations.accept(other.profile.id, id), null)
      const accepted = await Promise.all([
        a.invitations.accept(user.profile.id, id),
        b.invitations.accept(user.profile.id, id),
      ])
      assert.equal(accepted.filter(Boolean).length, 1)
      assert.equal(await b.access.role(user.profile.id, 'default'), 'viewer')
      assert.equal(await b.invitations.decline(user.profile.id, id), false)
      const names = await Promise.allSettled([
        a.invitations.setUsername(user.profile.id, 'designer'),
        b.invitations.setUsername(other.profile.id, 'designer'),
      ])
      assert.equal(
        names.filter((result) => result.status === 'fulfilled' && result.value)
          .length,
        1,
      )
      const invitations = await Promise.all(
        Array.from({ length: 24 }, (_, index) =>
          (index % 2 ? a : b).invitations.create(
            owner.profile.id,
            'default',
            `person${index}@example.test`,
            null,
            'member',
          ),
        ),
      )
      assert.equal(invitations.filter(Boolean).length, 19)
      const expired = (
        await a.query(
          "SELECT id,email FROM studio.account_invitations WHERE status='pending' LIMIT 1",
        )
      ).rows[0]
      assert.ok(expired)
      const late = await a.identity.registerGoogle(
        'late',
        expired.email,
        'Late recipient',
      )
      assert.equal(
        (await b.invitations.list(late.profile.id))[0].id,
        expired.id,
      )
      await a.query(
        'UPDATE studio.account_invitations SET expires_at=1 WHERE id=$1',
        [expired.id],
      )
      assert.equal(
        await a.invitations.accept(late.profile.id, expired.id),
        null,
      )
    } finally {
      await b.close()
      await a.query(`DROP SCHEMA ${schema} CASCADE`)
      await a.close()
    }
  },
)
