import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

test('PWA fetch policy leaves APIs and editor bundles online and falls back only on failed navigations', async () => {
  const handlers = new Map<string, (event: Record<string, unknown>) => void>()
  const cached = new Response('offline screen')
  const matches: string[] = []
  const requests: unknown[] = []
  let disconnected = false
  let response: Promise<Response> | undefined
  runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    self: { location: { origin: 'https://pomegranate.gilgil.co' }, addEventListener: (name: string, handler: (event: Record<string, unknown>) => void) => handlers.set(name, handler) },
    URL, Response,
    fetch: async (request: unknown) => { requests.push(request); if (disconnected) throw new Error('Offline'); return new Response('fresh') },
    caches: { match: async (path: string) => { matches.push(path); return cached } },
  })
  const dispatch = (path: string, mode = 'cors', method = 'GET'): Promise<Response> | undefined => {
    response = undefined
    handlers.get('fetch')!({ request: { url: new URL(path, 'https://pomegranate.gilgil.co').href, mode, method }, respondWith: (value: Promise<Response>) => { response = value } })
    return response
  }
  for (const path of ['/api', '/api/session', '/api/workspace', '/api/events', '/api/realtime', '/assets/editor.js', 'https://third-party.example/image.png'])
    assert.equal(dispatch(path), undefined)
  assert.equal(dispatch('/', 'navigate', 'POST'), undefined)
  assert.equal(await (await dispatch('/?workspace=default', 'navigate'))!.text(), 'fresh')
  assert.equal(matches.length, 0)
  disconnected = true
  assert.equal(await dispatch('/?workspace=default', 'navigate'), cached)
  assert.deepEqual(matches, ['/offline.html'])
  assert.equal(requests.length, 2)
})

test('install manifest has standalone scope and correctly sized PNG icons', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'))
  assert.equal(manifest.display, 'standalone')
  assert.equal(manifest.start_url, '/')
  assert.equal(manifest.scope, '/')
  assert.equal(manifest.id, '/')
  assert.ok(manifest.icons.some((icon: { sizes: string }) => icon.sizes === '192x192'))
  assert.ok(manifest.icons.some((icon: { sizes: string }) => icon.sizes === '512x512'))
  for (const icon of manifest.icons) {
    const png = readFileSync(new URL('../public' + icon.src, import.meta.url))
    assert.equal(png.subarray(1, 4).toString(), 'PNG')
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes)
  }
})
