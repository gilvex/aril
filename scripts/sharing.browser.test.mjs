import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { test } from 'node:test'
import { chromium } from 'playwright'
import { createSeed } from '@aril/domain/seed'
const requireStudio = createRequire(
  new URL('../apps/studio/package.json', import.meta.url),
)
const { preview } = await import(
  pathToFileURL(requireStudio.resolve('vite')).href
)

test('sharing UI creates independent view/edit links and a viewer cannot edit or paste nodes', async (t) => {
  const server = await preview({
    root: fileURLToPath(new URL('../apps/studio', import.meta.url)),
    preview: { host: '127.0.0.1', port: 0 },
  })
  t.after(() => new Promise((resolve) => server.httpServer.close(resolve)))
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.ARIL_TEST_BROWSER_CHANNEL || undefined,
  })
  t.after(() => browser.close())
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'en-US',
    serviceWorkers: 'block',
  })
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  const profile = {
    id: 'fixture-owner',
    name: 'Fixture owner',
    avatar: '',
    color: '#b34568',
  }
  const workspace = createSeed()
  let role = 'owner'
  let writes = 0
  const links = []
  const studio = () => ({
    id: 'fixture',
    name: 'Sharing fixture',
    role,
    createdAt: '2026-10-19',
  })
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.abort()
    const path = url.pathname,
      method = route.request().method()
    if (path === '/api/deployment-settings')
      return route.fulfill({ json: { productSiteEnabled: false } })
    if (path === '/api/session')
      return route.fulfill({
        json: { profile, accountLinked: true, inviteRequired: false },
      })
    if (path === '/api/studios') return route.fulfill({ json: [studio()] })
    if (path === '/api/workspace-access')
      return route.fulfill({ json: { role } })
    if (path === '/api/workspace') {
      if (method === 'GET')
        return route.fulfill({
          json: { workspace, revision: 1, savedAt: '2026-10-19' },
        })
      writes++
      return route.fulfill({
        status: 403,
        json: { error: 'Read-only fixture' },
      })
    }
    if (path === '/api/members')
      return route.fulfill({ json: [{ ...profile, role }] })
    if (path === '/api/account')
      return route.fulfill({
        json: {
          google: null,
          accounts: [
            {
              provider: 'yandex',
              issuer: 'https://login.yandex.ru',
              email: 'fixture@example.test',
            },
          ],
        },
      })
    if (path === '/api/auth/config')
      return route.fulfill({ json: { googleClientId: null } })
    if (path === '/api/guest-links') {
      if (method === 'GET') return route.fulfill({ json: links })
      const body = route.request().postDataJSON()
      const link = {
        id: 'link-' + (links.length + 1),
        name: body.name,
        role: body.role,
        expiresAt:
          body.minutes === null
            ? 8640000000000000
            : Date.now() + body.minutes * 60000,
        revoked: false,
        guests: 0,
      }
      links.push(link)
      return route.fulfill({
        status: 201,
        json: { ...link, token: String(links.length).repeat(43) },
      })
    }
    if (path.startsWith('/api/guest-links/')) {
      links.find((link) => path.endsWith('/' + link.id)).revoked = true
      return route.fulfill({ status: 204 })
    }
    if (path === '/api/events')
      return route.fulfill({
        contentType: 'text/event-stream',
        body: 'event: ready\ndata: {}\n\n',
      })
    if (
      path === '/api/presence' ||
      path === '/api/activity' ||
      path === '/api/history'
    )
      return route.fulfill({ json: [] })
    if (path.startsWith('/api/'))
      return route.fulfill({ status: 503, json: { error: 'Isolated fixture' } })
    return route.continue()
  })
  const page = await context.newPage()
  const url = origin + '/w/fixture/canvas/layers'
  await page.goto(url)
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'App', exact: true }).click()
  const { version } = JSON.parse(
    readFileSync(
      new URL('../apps/studio/package.json', import.meta.url),
      'utf8',
    ),
  )
  await page.getByText('Version ' + version, { exact: true }).waitFor()
  await page.getByRole('combobox', { name: 'Language', exact: true }).click()
  await page.getByRole('option', { name: 'Русский', exact: true }).click()
  await page.getByText('Версия ' + version, { exact: true }).waitFor()
  if (process.env.ARIL_CAPTURE_VERSION === '1') {
    await page
      .locator('.settings-content-inner')
      .screenshot({
        path: fileURLToPath(
          new URL(
            '../apps/studio/public/changelog/product-version.png',
            import.meta.url,
          ),
        ),
      })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  )
  assert.ok(
    await page.getByText('Версия ' + version, { exact: true }).isVisible(),
  )
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('combobox', { name: 'Язык', exact: true }).click()
  await page.getByRole('option', { name: 'English', exact: true }).click()

  await page.getByRole('button', { name: 'File', exact: true }).click()
  const section = page.locator('.guest-links')
  await section
    .getByRole('combobox', { name: 'Link permissions', exact: true })
    .waitFor()
  assert.equal(
    await section
      .getByRole('combobox', { name: 'Link permissions', exact: true })
      .innerText(),
    'View only',
  )
  await section
    .getByRole('textbox', { name: 'Link name', exact: true })
    .fill('Review only')
  await section
    .getByRole('combobox', { name: 'Duration unit', exact: true })
    .click()
  await page.getByRole('option', { name: 'No expiration', exact: true }).click()
  assert.equal(
    await section
      .getByRole('spinbutton', { name: 'Duration', exact: true })
      .count(),
    0,
  )
  await section
    .getByRole('button', { name: 'Create guest link', exact: true })
    .click()
  await section.getByText('Review only', { exact: true }).waitFor()
  assert.equal(links[0].expiresAt, 8640000000000000)
  await section
    .getByRole('combobox', { name: 'Duration unit', exact: true })
    .click()
  await page.getByRole('option', { name: 'Hours', exact: true }).click()
  await section
    .getByRole('combobox', { name: 'Link permissions', exact: true })
    .click()
  await page.getByRole('option', { name: 'Can edit', exact: true }).click()
  await section
    .getByRole('textbox', { name: 'Link name', exact: true })
    .fill('Work together')
  await section
    .getByRole('button', { name: 'Create guest link', exact: true })
    .click()
  await section.getByText('Work together', { exact: true }).waitFor()
  assert.deepEqual(
    links.map((link) => link.role),
    ['viewer', 'member'],
  )
  assert.equal(await section.locator('li').count(), 2)
  if (process.env.ARIL_CAPTURE_SHARING === '1') {
    await section
      .getByRole('combobox', { name: 'Duration unit', exact: true })
      .click()
    await page
      .getByRole('option', { name: 'No expiration', exact: true })
      .click()
    await section.scrollIntoViewIfNeeded()
    await section.screenshot({
      style: '.invite-output { display: none !important; }',
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/guest-links.png',
          import.meta.url,
        ),
      ),
    })
  }
  await section
    .locator('li')
    .filter({ hasText: 'Review only' })
    .getByRole('button', { name: 'Revoke', exact: true })
    .click()
  await section
    .locator('li')
    .filter({ hasText: 'Review only' })
    .waitFor({ state: 'detached' })
  assert.equal(await section.getByText('Revoked', { exact: true }).count(), 0)
  assert.equal(
    await section
      .getByRole('textbox', { name: 'Guest link', exact: true })
      .inputValue(),
    origin + '/#guest=' + '2'.repeat(43),
  )
  assert.equal(links[1].revoked, false)
  await page.reload()
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'File', exact: true }).click()
  await section.getByText('Work together', { exact: true }).waitFor()
  assert.equal(await section.locator('li').count(), 1)
  role = 'viewer'
  await page.goto(url)
  await page.getByRole('button', { name: 'Fit view', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Fit view', exact: true }).click()
  const id = workspace.boards[0].nodes[0].id
  await page.locator(`.react-flow__node[data-id="${id}"]`).dblclick()
  assert.ok(
    await page
      .getByRole('textbox', { name: 'Node title', exact: true })
      .isDisabled(),
  )
  const count = await page.locator('.react-flow__node').count()
  await page.evaluate(
    (payload) => {
      const data = new DataTransfer()
      data.setData('text/plain', JSON.stringify(payload))
      window.dispatchEvent(
        new ClipboardEvent('paste', {
          clipboardData: data,
          bubbles: true,
          cancelable: true,
        }),
      )
    },
    {
      format: 'aril-canvas',
      version: 1,
      nodes: [workspace.boards[0].nodes[0]],
      edges: [],
    },
  )
  assert.equal(await page.locator('.react-flow__node').count(), count)
  assert.equal(writes, 0)
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  )
})
