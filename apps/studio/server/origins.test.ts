import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { get } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createApp } from './app.ts'
import { normalizeStudioOrigins } from './utils/normalizeStudioOrigins.ts'

test('custom and legacy domains work without admitting foreign hosts or origins', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pomegranate-origins-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'test.sqlite'),
    'https://aril.studio',
    [
      'https://www.aril.studio',
      'https://arilapp.vercel.app',
      'https://pomegranate.gilgil.co',
      'https://pomegrenate.vercel.app',
    ],
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const port = (server.address() as { port: number }).port
  const call = (host: string, origin?: string, path = '/api/health') =>
    new Promise<number | undefined>((resolve, reject) => {
      get(
        `http://127.0.0.1:${port}${path}`,
        { headers: { Host: host, ...(origin ? { Origin: origin } : {}) } },
        (res) => {
          res.resume()
          resolve(res.statusCode)
        },
      ).on('error', reject)
    })
  try {
    for (const host of [
      'aril.studio',
      'www.aril.studio',
      'arilapp.vercel.app',
      'pomegranate.gilgil.co',
      'pomegrenate.vercel.app',
    ]) {
      assert.equal(await call(host, `https://${host}`), 200)
      assert.equal(await call(host, undefined, '/api/workspace'), 401)
      assert.equal(await call(host, 'https://unrelated.example'), 403)
      assert.equal(await call(host, `http://${host}`), 403)
      assert.equal(await call(host, `https://${host}:444`), 403)
    }
    assert.equal(await call('pomegranate.gilgil.co.evil.example'), 403)
    assert.equal(await call('aril.studio.evil.example'), 403)
    assert.equal(await call('arilapp.vercel.app.evil.example'), 403)
    assert.equal(
      await call('unrelated.example', 'https://pomegranate.gilgil.co'),
      403,
    )
    assert.equal(await call(`127.0.0.1:${port}`, 'http://127.0.0.1:5173'), 200)
  } finally {
    collaboration.close()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('origin configuration rejects credentials, paths and non-web schemes', () => {
  assert.deepEqual(
    normalizeStudioOrigins([
      'https://pomegranate.gilgil.co/',
      'https://pomegranate.gilgil.co',
    ]),
    ['https://pomegranate.gilgil.co'],
  )
  for (const origin of [
    'https://user:secret@example.com',
    'https://example.com/path',
    'file:///tmp',
    'https://example.com?query',
    'https://example.com#hash',
  ])
    assert.throws(() => normalizeStudioOrigins([origin]))
})
