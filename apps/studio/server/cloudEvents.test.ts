import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createApplication } from './app.ts'
import { openStore } from './store.ts'

test('hosted document streams resume from a known revision without rereading the workspace', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'aril-cloud-events-'))
  const store = openStore(join(directory, 'studio.sqlite'))
  const owner = store.identity.bootstrap()!
  let reads = 0
  const application = createApplication({
    ...store,
    read: (workspaceId?: string) => {
      reads++
      return store.read(workspaceId)
    },
    cloud: {
      revision: async (workspaceId: string) => store.read(workspaceId).revision,
    },
  })
  const server = application.app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  t.after(async () => {
    application.collaboration.close()
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  })
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const stream = async (query: string) => {
    const controller = new AbortController()
    const response = await fetch(
      `${url}/api/events?clientId=${randomUUID()}${query}`,
      {
        headers: {
          Authorization: 'Bearer ' + owner.token,
          'x-workspace-id': 'default',
        },
        signal: controller.signal,
      },
    )
    assert.equal(response.status, 200)
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let text = ''
    const deadline = Date.now() + 1500
    while (Date.now() < deadline && !text.includes('event: activity')) {
      const chunk = await Promise.race([
        reader.read(),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), deadline - Date.now()),
        ),
      ])
      if (!chunk || chunk.done) break
      text += decoder.decode(chunk.value, { stream: true })
    }
    controller.abort()
    return text
  }
  const current = store.read('default').revision
  reads = 0
  assert.match(await stream(''), /event: workspace/)
  assert.ok(reads > 0)
  reads = 0
  const resumed = await stream(`&revision=${current}`)
  assert.doesNotMatch(resumed, /event: workspace/)
  assert.equal(reads, 0)
  assert.match(
    await stream(`&revision=${current - 1 || 999}`),
    /event: workspace/,
  )
  assert.match(await stream('&revision=not-a-number'), /event: workspace/)
})
