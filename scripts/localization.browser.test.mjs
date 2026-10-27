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

test(
  'Russian startup waits for a delayed dictionary; demo and changelog remain localized',
  { timeout: 90000 },
  async (t) => {
    const server = await preview({
      root: fileURLToPath(new URL('../apps/studio', import.meta.url)),
      preview: { host: '127.0.0.1', port: 0 },
    })
    t.after(() => new Promise((resolve) => server.httpServer.close(resolve)))
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`
    const browser = await chromium.launch({
      headless: true,
      channel: process.env.ARIL_TEST_BROWSER_CHANNEL || undefined,
    })
    t.after(() => browser.close())
    const context = await browser.newContext({
      locale: 'ru-RU',
      viewport: { width: 1440, height: 900 },
      serviceWorkers: 'block',
    })
    t.after(() => context.close())
    let releaseLocale
    const localeGate = new Promise((resolve) => {
      releaseLocale = resolve
    })
    let requestedLocale
    const localeRequested = new Promise((resolve) => {
      requestedLocale = resolve
    })
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname === '/api/deployment-settings')
        return route.fulfill({ json: { productSiteEnabled: true } })
      if (url.pathname.startsWith('/api/')) return route.abort()
      if (/\/ru-[^/]+\.js$/.test(url.pathname)) {
        requestedLocale()
        await localeGate
      }
      return route.continue()
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(String(error)))
    await page.goto(origin + '/?demo=1', { waitUntil: 'commit' })
    await localeRequested
    await page.waitForTimeout(300)
    assert.equal(
      await page.locator('#root').innerText(),
      'Открываем ваше рабочее пространство…',
      'static loading screen is Russian while its dictionary is pending',
    )
    releaseLocale()
    await page
      .getByRole('button', { name: 'Показать сведения о доске', exact: true })
      .waitFor()
    await page.getByRole('button', { name: 'Замысел', exact: true }).click()
    await page.locator('.scope-quick-filters').getByText(/^Все/).waitFor()
    assert.equal(
      await page.getByRole('combobox').filter({ hasText: 'Все доски' }).count(),
      1,
    )
    if (process.env.ARIL_CAPTURE_LOCALIZATION === '1')
      await page.screenshot({
        path: 'apps/studio/public/changelog/russian-interface.png',
      })
    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(
      await page.locator('.scope-quick-filters').getByText(/^Все/).count(),
      1,
    )
    await page.goto(origin + '/changelog#2026-10-21-russian-interface')
    await page
      .getByRole('heading', {
        name: 'Русский язык с первого экрана',
        exact: true,
      })
      .waitFor()
    assert.deepEqual(errors, [])
  },
)
