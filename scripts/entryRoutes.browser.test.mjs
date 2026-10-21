import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { test } from 'node:test'
import { chromium } from 'playwright'

const requireStudio = createRequire(
  new URL('../apps/studio/package.json', import.meta.url),
)
const { preview } = await import(
  pathToFileURL(requireStudio.resolve('vite')).href
)
const root = fileURLToPath(new URL('../apps/studio', import.meta.url))

test(
  'landing, studio, source links and legacy entry routes work at desktop and mobile sizes',
  { timeout: 120000 },
  async (t) => {
    const server = await preview({
      root,
      preview: { host: '127.0.0.1', port: 0, strictPort: false },
    })
    t.after(() => new Promise((resolve) => server.httpServer.close(resolve)))
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`
    const browser = await chromium.launch({
      headless: true,
      channel: process.env.ARIL_TEST_BROWSER_CHANNEL || undefined,
    })
    t.after(() => browser.close())
    for (const productSiteEnabled of [true, false]) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        locale: 'en-US',
        serviceWorkers: 'block',
      })
      t.after(() => context.close())
      let sessionCalls = 0
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url())
        if (url.origin !== origin) return route.abort()
        if (url.pathname === '/api/deployment-settings')
          return route.fulfill({
            json: {
              productSiteEnabled,
              productName: 'Aril',
              productLogoUrl: '/aril.svg',
            },
          })
        if (url.pathname === '/api/auth/config')
          return route.fulfill({
            json: {
              googleClientId: null,
              yandexEnabled: true,
              oidcEnabled: true,
              oidcLabel: 'Company SSO',
            },
          })
        if (url.pathname === '/api/session') {
          sessionCalls++
          return route.fulfill({ status: 401, json: { inviteRequired: true } })
        }
        if (url.pathname.startsWith('/api/')) return route.abort()
        return route.continue()
      })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (error) => errors.push(String(error)))
      await page.goto(origin)
      await page.locator('.source-code-link').waitFor()
      assert.equal(
        await page.locator('.source-code-link').getAttribute('href'),
        'https://github.com/gilvex/aril',
      )
      if (productSiteEnabled) {
        await page.locator('.landing-page').waitFor()
        assert.equal(
          sessionCalls,
          0,
          'landing must not mount the authenticated app',
        )
        assert.equal(await page.locator('.login-auth').count(), 0)
        await page.evaluate(() => {
          location.hash = 'invite=same-document'
        })
        await page.waitForURL('**/app#invite=same-document')
        await page.locator('.login-auth').waitFor()
        await page.goto(origin)
        await page.getByRole('link', { name: 'Sign in', exact: true }).click()
        assert.equal(new URL(page.url()).pathname, '/app')
      }
      await page
        .getByRole('button', { name: 'Sign in with Company SSO', exact: true })
        .waitFor()
      assert.equal(await page.locator('.landing-page').count(), 0)
      await page.reload()
      await page.locator('.login-auth').waitFor()
      for (const suffix of [
        '#invite=fixture',
        '#guest=fixture',
        '#transfer=fixture',
      ]) {
        await page.goto(origin + '/' + suffix)
        await page.locator('.source-code-link').waitFor()
        assert.equal(new URL(page.url()).pathname, '/app', suffix)
        // Transfer tokens are consumed by the auth flow; invitation tokens remain until redeemed.
        if (!suffix.startsWith('#transfer'))
          assert.equal(new URL(page.url()).hash, suffix)
        assert.equal(await page.locator('.landing-page').count(), 0)
      }
      await page.goto(origin + '/app')
      await page
        .getByRole('button', { name: 'Sign in with Company SSO', exact: true })
        .waitFor()
      await page.setViewportSize({ width: 390, height: 844 })
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      )
      const rect = await page.locator('.source-code-link').boundingBox()
      assert.ok(
        rect &&
          rect.x >= 0 &&
          rect.y >= 0 &&
          rect.x + rect.width <= 390 &&
          rect.y + rect.height <= 844,
      )
      if (productSiteEnabled) {
        await page.goto(
          origin + '/app?demo=1&workspace=demo&board=layers&view=canvas',
        )
        const navigation = page.locator(
          '.workspace-session:not([hidden]) .mobile-bottom-nav',
        )
        await navigation.waitFor()
        const nav = await navigation.boundingBox()
        const source = await page.locator('.source-code-link').boundingBox()
        assert.ok(
          nav && source && source.y + source.height <= nav.y,
          'source link must stay above mobile navigation',
        )
      }
      if (!productSiteEnabled) {
        await page.goto(
          origin + '/?demo=1&workspace=demo&board=layers&view=canvas',
        )
        await page.locator('.login-auth').waitFor()
        assert.equal(new URL(page.url()).searchParams.has('demo'), false)
        await page.goto(origin + '/changelog')
        await page.locator('.login-auth').waitFor()
        assert.equal(new URL(page.url()).pathname, '/app')
      }
      assert.deepEqual(errors, [])
      await context.close()
    }
  },
)
