import { z } from 'zod'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createApp } from './app.ts'
import { loadDeploymentSettings } from '../src/shared/deploymentSettings/utils/loadDeploymentSettings.ts'
import { isProductSiteEnabled } from '../src/shared/deploymentSettings/utils/isProductSiteEnabled.ts'
import { isDemoMode } from '../src/shared/utils/isDemoMode.ts'

test('company mode is runtime-configured, redirects product pages and preserves sessions', async () => {
  const previous = process.env.ARIL_PRODUCT_SITE_ENABLED
  const previousName = process.env.ARIL_PRODUCT_NAME
  const previousLogo = process.env.ARIL_PRODUCT_LOGO_URL
  delete process.env.ARIL_PRODUCT_NAME
  delete process.env.ARIL_PRODUCT_LOGO_URL
  const directory = mkdtempSync(join(tmpdir(), 'aril-company-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'fixture.sqlite'),
  )
  const owner = store.identity.bootstrap()!
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  try {
    delete process.env.ARIL_PRODUCT_SITE_ENABLED
    assert.deepEqual(
      await (await fetch(origin + '/api/deployment-settings')).json(),
      {
        productSiteEnabled: true,
        productName: 'Aril',
        productLogoUrl: '/aril.svg',
      },
    )
    process.env.ARIL_PRODUCT_SITE_ENABLED = 'false'
    const config = await fetch(origin + '/api/deployment-settings')
    assert.deepEqual(await config.json(), {
      productSiteEnabled: false,
      productName: 'Aril',
      productLogoUrl: '/aril.svg',
    })
    assert.equal(config.headers.get('cache-control'), 'no-store')
    process.env.ARIL_PRODUCT_NAME = 'Company Studio'
    process.env.ARIL_PRODUCT_LOGO_URL = 'https://company.example/logo.svg'
    const manifest = z
      .object({
        name: z.string(),
        short_name: z.string(),
        icons: z.array(z.object({ src: z.string() })),
      })
      .parse(await (await fetch(origin + '/api/manifest.webmanifest')).json())
    assert.equal(manifest.name, 'Company Studio')
    assert.equal(manifest.short_name, 'Company Studio')
    assert.equal(manifest.icons[0].src, 'https://company.example/logo.svg')
    assert.deepEqual(
      await (await fetch(origin + '/api/deployment-settings')).json(),
      {
        productSiteEnabled: false,
        productName: 'Company Studio',
        productLogoUrl: 'https://company.example/logo.svg',
      },
    )
    for (const path of [
      '/changelog',
      '/changelog/',
      '/changelog/canvas.webp',
    ]) {
      const response = await fetch(origin + path, { redirect: 'manual' })
      assert.equal(response.status, 302)
      assert.equal(response.headers.get('location'), '/')
    }
    assert.equal(
      (
        await fetch(origin + '/api/session', {
          headers: { Authorization: 'Bearer ' + owner.token },
        })
      ).status,
      200,
    )
    assert.equal((await fetch(origin + '/api/health')).status, 200)
    assert.equal(store.studios(owner.profile.id).length, 1)
  } finally {
    if (previous === undefined) delete process.env.ARIL_PRODUCT_SITE_ENABLED
    else process.env.ARIL_PRODUCT_SITE_ENABLED = previous
    if (previousName === undefined) delete process.env.ARIL_PRODUCT_NAME
    else process.env.ARIL_PRODUCT_NAME = previousName
    if (previousLogo === undefined) delete process.env.ARIL_PRODUCT_LOGO_URL
    else process.env.ARIL_PRODUCT_LOGO_URL = previousLogo
    collaboration.close()
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('frontend loads settings before demo and fails closed on errors or malformed config', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ productSiteEnabled: true }),
  )
  await loadDeploymentSettings()
  assert.equal(isProductSiteEnabled(), true)
  assert.equal(isDemoMode('?demo=1'), true)
  for (const body of [
    { productSiteEnabled: false },
    {},
    { productSiteEnabled: 'true' },
  ]) {
    mock.mock.mockImplementation(async () => Response.json(body))
    await loadDeploymentSettings()
    assert.equal(isProductSiteEnabled(), false)
    assert.equal(isDemoMode('?demo=1'), false)
  }
  mock.mock.mockImplementation(async () => {
    throw new Error('Offline')
  })
  await loadDeploymentSettings()
  assert.equal(isProductSiteEnabled(), false)
  mock.mock.mockImplementation(async () =>
    Response.json({ productSiteEnabled: true }),
  )
  await loadDeploymentSettings()
})
