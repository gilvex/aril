import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from './app.ts'
import { createSeed } from '@pomegranate/domain/seed'
import { makeWireNode } from '@pomegranate/domain/wireframe'
import { diffWorkspace } from '@pomegranate/domain/collaboration'
import { isFreshDraft, writeVersion } from '@pomegranate/domain/freshness'

test('recovery requires the current protocol, revision and unchanged base document', () => {
  const latest = {
    workspace: createSeed(),
    revision: 10,
    savedAt: new Date().toISOString(),
  }
  const workspace = { ...latest.workspace, notes: 'My unsaved note' }
  assert.equal(
    isFreshDraft({ base: latest, workspace, writeVersion }, latest),
    true,
  )
  assert.equal(
    isFreshDraft(
      { base: { ...latest, revision: 9 }, workspace, writeVersion },
      latest,
    ),
    false,
  )
  assert.equal(isFreshDraft({ base: latest, workspace }, latest), false)
  assert.equal(
    isFreshDraft(
      { base: { ...latest, workspace }, workspace, writeVersion },
      latest,
    ),
    false,
  )
})

test('old tabs and stale destructive writes cannot remove newer wireframes', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pomegranate-freshness-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'studio.sqlite'),
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const identity = store.identity.bootstrap()!
  const call = (
    method: string,
    body: unknown,
    version: string | null = writeVersion,
  ) =>
    fetch(url + '/api/workspace', {
      method,
      headers: {
        Authorization: `Bearer ${identity.token}`,
        'Content-Type': 'application/json',
        ...(version ? { 'x-pomegranate-write-version': version } : {}),
      },
      body: JSON.stringify(body),
    })
  try {
    const before = store.read()
    const withWireframe = structuredClone(before.workspace)
    withWireframe.boards[0].wireframe = {
      nodes: [makeWireNode('screen', 'fresh-screen', { x: 0, y: 0 })],
      edges: [],
    }
    const fresh = store.save(withWireframe, before.revision)!
    const deletion = diffWorkspace(fresh.workspace, before.workspace)
    // An old bundle cannot save even if it happens to know the current revision.
    assert.equal(
      (
        await call(
          'PATCH',
          {
            requestId: randomUUID(),
            baseRevision: fresh.revision,
            operations: deletion,
          },
          null,
        )
      ).status,
      428,
    )
    assert.equal(
      (
        await call(
          'PUT',
          { revision: fresh.revision, workspace: before.workspace },
          null,
        )
      ).status,
      428,
    )
    assert.equal(
      (await call('PATCH', { requestId: randomUUID(), operations: deletion }))
        .status,
      400,
    )
    const newer = store.save(
      { ...fresh.workspace, notes: 'Newer collaborator edit' },
      fresh.revision,
    )!
    const stale = await call('PATCH', {
      requestId: randomUUID(),
      baseRevision: fresh.revision,
      operations: deletion,
    })
    assert.equal(stale.status, 409)
    assert.equal(
      ((await stale.json()) as { code: string }).code,
      'STALE_REVISION',
    )
    assert.equal(
      (
        await call('PUT', {
          revision: fresh.revision,
          workspace: before.workspace,
        })
      ).status,
      409,
    )
    assert.deepEqual(store.read(), newer)
    // Fresh edits work, and a repeated successful request remains idempotent.
    const requestId = randomUUID(),
      operations = diffWorkspace(newer.workspace, {
        ...newer.workspace,
        notes: 'Current edit',
      })
    const body = { requestId, baseRevision: newer.revision, operations }
    assert.equal((await call('PATCH', body)).status, 200)
    const saved = store.read()
    assert.equal((await call('PATCH', body)).status, 200)
    assert.deepEqual(store.read(), saved)
    assert.equal(
      saved.workspace.boards[0].wireframe?.nodes[0].id,
      'fresh-screen',
    )
  } finally {
    collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})
