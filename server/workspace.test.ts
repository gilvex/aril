import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { get } from 'node:http'
import { createApp } from './app.ts'
import { openStore } from './store.ts'
import {
  workspaceSchema,
  type Envelope,
  type Workspace,
} from '../domain/workspace.ts'

test('workspace persistence, stale-write protection, history and invalid graph rejection', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pomegranate-test-'))
  const database = join(directory, 'test.sqlite')
  const { app, store } = createApp(database)
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address() as { port: number }
  const url = `http://127.0.0.1:${address.port}`
  const session = await globalThis.fetch(`${url}/api/session`)
  const cookie = session.headers.get('set-cookie')!.split(';')[0]
  const fetch = (input: string, options?: RequestInit) =>
    globalThis.fetch(input, {
      ...options,
      headers: {
        ...options?.headers,
        Cookie: cookie,
        'x-pomegranate-write-version': '2',
      },
    })
  const put = (body: unknown) =>
    fetch(`${url}/api/workspace`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  try {
    const initial = (await (
      await fetch(`${url}/api/workspace`)
    ).json()) as Envelope
    assert.equal(initial.workspace.requirements.length, 15)
    const workspace = workspaceSchema.parse(initial.workspace)
    workspace.boards[0].nodes[0].position = { x: 42, y: 99 }
    workspace.notes = 'A durable planning note'
    const saved = await put({ workspace, revision: initial.revision })
    assert.equal(saved.status, 200)
    assert.equal(((await saved.json()) as Envelope).revision, 2)
    assert.equal((await put({ workspace, revision: 1 })).status, 409)
    const invalid = structuredClone(workspace)
    invalid.boards[0].edges[0].target = 'missing-node'
    assert.equal((await put({ workspace: invalid, revision: 2 })).status, 400)
    assert.equal(
      (
        await fetch(`${url}/api/workspace`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'https://unrelated.example',
          },
          body: JSON.stringify({ workspace, revision: 2 }),
        })
      ).status,
      403,
    )
    const foreignHostStatus = await new Promise<number | undefined>(
      (resolve, reject) => {
        get(
          `${url}/api/workspace`,
          { headers: { Host: 'unrelated.example' } },
          (response) => {
            response.resume()
            resolve(response.statusCode)
          },
        ).on('error', reject)
      },
    )
    assert.equal(foreignHostStatus, 403)
    const snapshot = (await (
      await fetch(`${url}/api/history/1`)
    ).json()) as Workspace
    assert.notEqual(snapshot.notes, workspace.notes)
    assert.equal((await fetch(`${url}/api/history/999`)).status, 404)
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
  }
  try {
    const reopened = openStore(database)
    assert.equal(reopened.read().workspace.notes, 'A durable planning note')
    assert.deepEqual(reopened.read().workspace.boards[0].nodes[0].position, {
      x: 42,
      y: 99,
    })
    reopened.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
