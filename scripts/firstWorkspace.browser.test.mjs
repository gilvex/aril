import { createSeed } from '@aril/domain/seed'
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

test('first sign-in opens create and optional join flows without requiring an invitation', async (t) => {
  const server = await preview({
    root: fileURLToPath(new URL('../apps/studio', import.meta.url)),
    preview: { host: '127.0.0.1', port: 0, strictPort: false },
  })
  t.after(() => new Promise((resolve) => server.httpServer.close(resolve)))
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.ARIL_TEST_BROWSER_CHANNEL || undefined,
  })
  t.after(() => browser.close())
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    colorScheme: 'dark',
    serviceWorkers: 'block',
  })
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  const profile = {
    id: 'fixture-new-member',
    name: 'New member (demo)',
    color: '#b34568',
    avatar: '',
  }
  let accountFixture = {
    google: null,
    accounts: [
      {
        provider: 'yandex',
        issuer: 'https://login.yandex.ru',
        email: 'fixture@example.test',
      },
    ],
  }
  const workspaceFixture = createSeed()
  let failRename = false
  const studios = []
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.abort()
    if (url.pathname === '/api/deployment-settings')
      return route.fulfill({
        json: {
          productSiteEnabled: false,
          productName: 'Aril',
          productLogoUrl: '/aril.svg',
        },
      })
    if (url.pathname === '/api/session')
      return route.fulfill({
        json: { profile, accountLinked: true, inviteRequired: false },
      })
    if (url.pathname === '/api/auth/config')
      return route.fulfill({
        json: { googleClientId: null, yandexEnabled: true, oidcEnabled: true },
      })
    if (url.pathname === '/api/account')
      return route.fulfill({ json: accountFixture })
    if (url.pathname === '/api/studios/fixture-project') {
      const body = route.request().postDataJSON()
      if (route.request().method() === 'PATCH') {
        if (failRename)
          return route.fulfill({
            status: 409,
            json: {
              error: 'The workspace changed. Refresh the list and try again.',
            },
          })
        studios[0].name = body.name.trim()
      } else {
        assert.equal(body.name, studios[0].name)
        studios.splice(0, 1)
      }
      return route.fulfill({ status: 204 })
    }
    if (url.pathname === '/api/studios/overview')
      return route.fulfill({
        json: studios.map((studio) => ({
          ...studio,
          nodes: [],
          edges: [],
          members: [profile],
          memberCount: 1,
          boardCount: 1,
        })),
      })
    if (
      url.pathname === '/api/studios' &&
      route.request().method() === 'POST'
    ) {
      const body = route.request().postDataJSON()
      const studio = {
        id: 'fixture-project',
        name: body.name,
        role: 'owner',
        createdAt: '2026-10-19T09:00:00.000Z',
      }
      studios.push(studio)
      return route.fulfill({ status: 201, json: studio })
    }
    if (url.pathname === '/api/studios') return route.fulfill({ json: studios })
    if (url.pathname === '/api/workspace')
      return route.fulfill({
        json: {
          workspace: workspaceFixture,
          revision: 1,
          savedAt: '2026-10-21',
        },
      })
    if (url.pathname === '/api/workspace-access')
      return route.fulfill({ json: { role: studios[0]?.role || null } })
    if (url.pathname === '/api/members')
      return route.fulfill({ json: [{ ...profile, role: studios[0]?.role }] })
    if (url.pathname === '/api/events')
      return route.fulfill({
        contentType: 'text/event-stream',
        body: 'event: ready\ndata: {}\n\n',
      })
    if (
      [
        '/api/presence',
        '/api/activity',
        '/api/history',
        '/api/guest-links',
      ].includes(url.pathname)
    )
      return route.fulfill({ json: [] })
    if (url.pathname.startsWith('/api/'))
      return route.fulfill({
        status: 503,
        json: { error: 'Isolated editor fixture' },
      })
    return route.continue()
  })
  const page = await context.newPage()
  await page.goto(origin)
  await page
    .getByRole('heading', {
      name: 'Your first workspace starts here',
      exact: true,
    })
    .waitFor()
  assert.equal(
    await page
      .getByRole('textbox', { name: 'Invite code', exact: true })
      .count(),
    0,
  )
  if (process.env.ARIL_CAPTURE_ONBOARDING === '1')
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/first-workspace.png',
          import.meta.url,
        ),
      ),
      fullPage: true,
      animations: 'disabled',
    })
  await page
    .getByRole('button', { name: 'Join workspace', exact: true })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('textbox', { name: 'Invite link', exact: true })
    .waitFor()
  assert.ok(['/', '/app'].includes(new URL(page.url()).pathname))
  await page.keyboard.press('Escape')
  await page
    .getByRole('heading', {
      name: 'Your first workspace starts here',
      exact: true,
    })
    .waitFor()
  await page.goto(origin + '/#invite=fixture-code')
  await page.reload()
  await page
    .getByRole('textbox', { name: 'Invite code', exact: true })
    .waitFor()
  assert.equal(
    await page
      .getByRole('textbox', { name: 'Invite code', exact: true })
      .inputValue(),
    'fixture-code',
  )
  await page
    .getByRole('button', { name: 'Go to my workspaces', exact: true })
    .click()
  assert.equal(new URL(page.url()).hash, '')
  await page.getByRole('button', { name: 'New workspace', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Workspace name', exact: true })
    .fill('My first project')
  await page
    .getByRole('button', { name: 'Create workspace', exact: true })
    .click()
  await page.waitForURL('**/w/fixture-project/canvas')
  assert.equal(studios.length, 1)
  assert.equal(studios[0].name, 'My first project')
  await page.goto(origin)
  await page
    .getByRole('button', { name: 'Open My first project', exact: true })
    .waitFor()

  await page.evaluate((studio) => {
    sessionStorage.setItem(
      'aril:workspaceTabs:fixture-new-member',
      JSON.stringify([studio]),
    )
  }, studios[0])
  await page
    .getByRole('button', {
      name: 'Workspace actions for My first project',
      exact: true,
    })
    .click()
  assert.equal(new URL(page.url()).pathname, '/app')
  await page.getByRole('menuitem', { name: 'Rename', exact: true }).click()
  let dialog = page.getByRole('dialog', {
    name: 'Rename workspace',
    exact: true,
  })
  await dialog
    .getByRole('textbox', { name: 'Workspace name', exact: true })
    .fill('Renamed project')
  failRename = true
  await dialog.getByRole('button', { name: 'Save', exact: true }).click()
  await dialog.getByRole('alert').waitFor()
  assert.equal(
    await dialog.getByRole('textbox').inputValue(),
    'Renamed project',
  )
  failRename = false
  await dialog.getByRole('button', { name: 'Save', exact: true }).click()
  await page
    .getByRole('button', { name: 'Open Renamed project', exact: true })
    .waitFor()
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(
          sessionStorage.getItem('aril:workspaceTabs:fixture-new-member'),
        )[0].name,
    ),
    'Renamed project',
  )
  await page
    .getByRole('button', {
      name: 'Workspace actions for Renamed project',
      exact: true,
    })
    .focus()
  await page.keyboard.press('Enter')
  await page.getByRole('menuitem', { name: 'Rename', exact: true }).waitFor()
  if (process.env.ARIL_CAPTURE_WORKSPACE_ACTIONS === '1')
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/workspace-actions.png',
          import.meta.url,
        ),
      ),
      animations: 'disabled',
    })
  await page.keyboard.press('Escape')
  await page.waitForFunction(
    () =>
      document.activeElement?.getAttribute('aria-label') ===
      'Workspace actions for Renamed project',
  )
  for (const fixture of [
    { google: { email: 'fixture@example.test' }, accounts: [] },
    {
      google: null,
      accounts: [
        {
          provider: 'google',
          issuer: 'https://accounts.google.com',
          email: 'fixture@example.test',
        },
      ],
    },
    {
      google: null,
      accounts: [
        {
          provider: 'yandex',
          issuer: 'https://login.yandex.ru',
          email: 'fixture@example.test',
        },
      ],
    },
    {
      google: null,
      accounts: [
        {
          provider: 'oidc',
          issuer: 'https://id.example.test',
          email: 'fixture@example.test',
        },
      ],
    },
  ]) {
    accountFixture = fixture
    await page.reload()
    await page.getByLabel('Your account', { exact: true }).click()
    await page
      .getByRole('button', { name: 'Account settings', exact: true })
      .click()
    await page.getByText('Account access', { exact: true }).waitFor()
    assert.equal(
      await page.getByRole('button', { name: /^Connect / }).count(),
      0,
    )
    await page.getByText('fixture@example.test', { exact: true }).waitFor()
  }
  accountFixture = { google: null, accounts: [] }
  await page.reload()
  await page.getByLabel('Your account', { exact: true }).click()
  await page
    .getByRole('button', { name: 'Account settings', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Connect Yandex ID', exact: true })
    .waitFor()
  await page.getByRole('button', { name: 'Connect SSO', exact: true }).waitFor()
  accountFixture = {
    google: null,
    accounts: [
      {
        provider: 'yandex',
        issuer: 'https://login.yandex.ru',
        email: 'fixture@example.test',
      },
    ],
  }
  await page.reload()
  await page.getByLabel('Your account', { exact: true }).click()
  await page
    .getByRole('button', { name: 'Account settings', exact: true })
    .click()
  await page.getByText('Account access', { exact: true }).waitFor()
  if (process.env.ARIL_CAPTURE_MANAGEMENT === '1')
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/workspace-management.png',
          import.meta.url,
        ),
      ),
      animations: 'disabled',
    })
  await page.keyboard.press('Escape')
  await page.getByLabel('Your account', { exact: true }).click()
  await page
    .getByRole('button', { name: 'Open Renamed project', exact: true })
    .click({ button: 'right' })
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Delete workspace', exact: true })
  assert.ok(
    await dialog
      .getByRole('button', { name: 'Delete workspace', exact: true })
      .isDisabled(),
  )
  await dialog.getByRole('textbox').fill('Wrong name')
  assert.ok(
    await dialog
      .getByRole('button', { name: 'Delete workspace', exact: true })
      .isDisabled(),
  )
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  assert.equal(studios.length, 1)
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(
    await page
      .getByRole('button', { name: 'New workspace', exact: true })
      .isVisible(),
  )
  assert.ok(
    await page
      .getByRole('button', { name: 'Join workspace', exact: true })
      .isVisible(),
  )
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  )
  await page.evaluate(() => localStorage.setItem('pomegranate-language', 'ru'))
  await page.reload()
  await page
    .getByRole('button', { name: 'Присоединиться к пространству', exact: true })
    .waitFor()
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  )

  await page
    .getByRole('button', {
      name: 'Действия с пространством Renamed project',
      exact: true,
    })
    .click()
  const renameRu = page.getByRole('menuitem', {
    name: 'Переименовать',
    exact: true,
  })
  assert.equal(await renameRu.innerText(), 'Переименовать')
  await renameRu.click()
  dialog = page.getByRole('dialog', {
    name: 'Переименовать пространство',
    exact: true,
  })
  await dialog.waitFor()
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).click()
  await page
    .getByRole('button', {
      name: 'Действия с пространством Renamed project',
      exact: true,
    })
    .click()
  await page.getByRole('menuitem', { name: 'Удалить', exact: true }).click()
  dialog = page.getByRole('dialog', {
    name: 'Удалить пространство',
    exact: true,
  })
  await dialog.waitFor()
  const typography = await dialog.locator('form > p').evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      size: style.fontSize,
      weight: style.fontWeight,
      family: style.fontFamily,
      bodyFamily: getComputedStyle(document.body).fontFamily,
    }
  })
  assert.equal(typography.size, '14px')
  assert.equal(typography.weight, '400')
  assert.equal(typography.family, typography.bodyFamily)
  await page.setViewportSize({ width: 1440, height: 900 })
  if (process.env.ARIL_CAPTURE_MANAGEMENT === '1')
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/workspace-management.png',
          import.meta.url,
        ),
      ),
      animations: 'disabled',
    })
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  )
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).click()
  await page.evaluate(() => localStorage.setItem('pomegranate-language', 'en'))
  await page.reload()
  studios[0].role = 'viewer'
  await page.reload()
  await page
    .getByRole('button', { name: 'Open Renamed project', exact: true })
    .waitFor()
  assert.equal(
    await page
      .getByRole('button', {
        name: 'Workspace actions for Renamed project',
        exact: true,
      })
      .count(),
    0,
  )
  assert.equal(
    await page.getByRole('menuitem', { name: 'Rename', exact: true }).count(),
    0,
  )
  studios[0].role = 'owner'
  await page.goto(origin + '/w/fixture-project/settings')
  await page
    .getByRole('button', {
      name: 'Workspace actions for Renamed project',
      exact: true,
    })
    .click()
  await page.getByRole('menuitem', { name: 'Rename', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Rename workspace', exact: true })
  await dialog.getByRole('textbox').fill('Settings project')
  await dialog.getByRole('button', { name: 'Save', exact: true }).click()
  await page
    .getByRole('heading', { name: 'Settings project', exact: true })
    .waitFor()
  assert.equal(new URL(page.url()).pathname, '/w/fixture-project/settings')
  assert.equal(
    await page
      .locator('.workspace-tabs-bar')
      .getByText('Settings project', { exact: true })
      .count(),
    1,
  )
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(
          sessionStorage.getItem('aril:workspaceTabs:fixture-new-member'),
        )[0].name,
    ),
    'Settings project',
  )
  await page
    .getByRole('button', {
      name: 'Workspace actions for Settings project',
      exact: true,
    })
    .click()
  await page.getByRole('menuitem', { name: 'Rename', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Rename workspace', exact: true })
  await dialog.getByRole('textbox').fill('Renamed project')
  await dialog.getByRole('button', { name: 'Save', exact: true }).click()
  await page
    .getByRole('heading', { name: 'Renamed project', exact: true })
    .waitFor()
  studios[0].role = 'viewer'
  await page.reload()
  await page
    .getByRole('heading', { name: 'Renamed project', exact: true })
    .waitFor()
  assert.equal(
    await page
      .getByRole('button', {
        name: 'Workspace actions for Renamed project',
        exact: true,
      })
      .count(),
    0,
  )
  studios[0].role = 'owner'
  await page.reload()
  await page
    .getByRole('button', {
      name: 'Workspace actions for Renamed project',
      exact: true,
    })
    .click()
  if (process.env.ARIL_CAPTURE_WORKSPACE_ACTIONS === '1') {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../artifacts/review/file-settings-actions.png',
          import.meta.url,
        ),
      ),
      animations: 'disabled',
    })
    await page.setViewportSize({ width: 390, height: 844 })
  }
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Delete workspace', exact: true })
  assert.ok(await dialog.isVisible())
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  )
  await dialog.getByRole('textbox').fill('Renamed project')
  await dialog
    .getByRole('button', { name: 'Delete workspace', exact: true })
    .click()
  await page
    .getByRole('heading', {
      name: 'Your first workspace starts here',
      exact: true,
    })
    .waitFor()
  assert.equal(studios.length, 0)
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(
        sessionStorage.getItem('aril:workspaceTabs:fixture-new-member'),
      ),
    ),
    [],
  )
  await page.reload()
  await page
    .getByRole('heading', {
      name: 'Your first workspace starts here',
      exact: true,
    })
    .waitFor()
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(
        sessionStorage.getItem('aril:workspaceTabs:fixture-new-member'),
      ),
    ),
    [],
  )
})
