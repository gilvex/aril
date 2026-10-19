import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { openPostgres } from './postgres.ts'

test(
  'Postgres management: owner checks, stale names, deletion and restart preserve isolation',
  { skip: !process.env.POSTGRES_TEST_URL },
  async () => {
    const schema = 'aril_management_' + randomUUID().replaceAll('-', '')
    const store = await openPostgres(process.env.POSTGRES_TEST_URL!, schema)
    try {
      const owner = await store.identity.bootstrap()
      assert.ok(owner)
      const editor = await store.identity.registerAccount(
        'yandex',
        'https://login.yandex.ru',
        'editor',
        'fixture@example.test',
        'Editor',
      )
      const studio = await store.createStudio(owner.profile.id, 'Project')
      const other = await store.createStudio(owner.profile.id, 'Other')
      await store.identity.join(
        (await store.identity.invite(owner.profile.id, studio.id)).token,
        'Editor',
        editor.profile.id,
      )
      const before = await store.read(studio.id)
      assert.equal(
        await store.renameStudio(
          editor.profile.id,
          studio.id,
          'Wrong',
          'Project',
        ),
        false,
      )
      assert.equal(
        await store.deleteStudio(editor.profile.id, studio.id, 'Project'),
        false,
      )
      assert.equal(
        await store.renameStudio(
          owner.profile.id,
          studio.id,
          'Renamed',
          'Project',
        ),
        true,
      )
      assert.deepEqual(await store.read(studio.id), before)
      assert.equal(
        await store.deleteStudio(owner.profile.id, studio.id, 'Project'),
        false,
      )
      const invitation = await store.identity.invite(
        owner.profile.id,
        studio.id,
      )
      const link = await store.guests.create(
        owner.profile.id,
        studio.id,
        'Guest',
        60,
      )
      const guest = await store.identity.redeemGuest(link.token, 'Guest')
      assert.ok(guest)
      const agent = await store.agents.create(
        owner.profile.id,
        studio.id,
        'Agent',
        'write',
        1,
      )
      const outcomes = await Promise.allSettled([
        store.save(
          before.workspace,
          before.revision,
          {
            id: owner.profile.id,
            name: 'Owner',
            message: 'Fixture',
            requestId: 'fixture',
          },
          studio.id,
          owner.profile.id,
        ),
        store.deleteStudio(owner.profile.id, studio.id, 'Renamed'),
      ])
      assert.equal(outcomes[1].status, 'fulfilled')
      if (outcomes[1].status === 'fulfilled')
        assert.equal(outcomes[1].value, true)
      assert.equal(await store.member(editor.profile.id, studio.id), false)
      assert.equal(await store.identity.join(invitation.token, 'Late'), null)
      assert.equal(
        await store.identity.redeemGuest(link.token, 'Late guest'),
        null,
      )
      assert.equal(await store.identity.authenticate(guest.token), undefined)
      assert.equal(await store.agents.authenticate(agent.token), undefined)
      await assert.rejects(store.read(studio.id), /not found/)
      assert.ok(await store.read(other.id))
      assert.equal(
        await store.deleteStudio(owner.profile.id, 'default', 'Aril'),
        true,
      )
      const second = await openPostgres(process.env.POSTGRES_TEST_URL!, schema)
      try {
        await assert.rejects(second.read('default'), /not found/)
        assert.ok(await second.read(other.id))
      } finally {
        await second.close()
      }
    } finally {
      await store.query(`DROP SCHEMA ${schema} CASCADE`)
      await store.close()
    }
  },
)
