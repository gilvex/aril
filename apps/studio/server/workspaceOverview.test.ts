import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from './app.ts'
import { sortWorkspaces } from '../src/pages/workspaces/utils/sortWorkspaces.ts'
import type { StudioOverview } from '@pomegranate/domain/studios'

test('workspace overviews are membership-scoped and expose bounded diagram metadata only', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pomegranate-overviews-'))
  const { app, store, collaboration } = createApp(join(dir, 'test.sqlite'))
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  try {
    const owner = store.identity.bootstrap()!
    const privateStudio = store.createStudio(
      owner.profile.id,
      'Private workspace',
    )
    const invited = store.identity.join(
      store.identity.invite(owner.profile.id).token,
      'Member',
    )!
    assert.equal((await fetch(url + '/api/studios/overview')).status, 401)
    const response = await fetch(url + '/api/studios/overview', {
      headers: { Authorization: `Bearer ${invited.token}` },
    })
    assert.equal(response.status, 200)
    const overview = (await response.json()) as StudioOverview[]
    assert.equal(overview.length, 1)
    assert.equal(overview[0].id, 'default')
    assert.equal(overview[0].role, 'member')
    assert.equal(overview[0].memberCount, 2)
    assert.ok(overview[0].nodes.length > 0 && overview[0].nodes.length <= 16)
    assert.ok(overview[0].edges.length <= 32)
    assert.ok(overview[0].members.length <= 3)
    assert.deepEqual(Object.keys(overview[0].nodes[0]).sort(), [
      'id',
      'kind',
      'title',
      'x',
      'y',
    ])
    assert.deepEqual(Object.keys(overview[0].members[0]).sort(), [
      'color',
      'id',
      'name',
    ])
    assert.equal(JSON.stringify(overview).includes(privateStudio.id), false)
    const all = store.studioOverviews(owner.profile.id)
    assert.equal(all.find((s) => s.id === privateStudio.id)?.nodes.length, 0)
    const untouched = all.map((s) => s.id)
    assert.equal(
      sortWorkspaces(all, '  PRIVATE ', 'name', {}, 'en')[0].id,
      privateStudio.id,
    )
    assert.equal(
      sortWorkspaces(all, '', 'recent', { [privateStudio.id]: 100 }, 'en')[0]
        .id,
      privateStudio.id,
    )
    assert.deepEqual(
      all.map((s) => s.id),
      untouched,
    )
  } finally {
    collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
