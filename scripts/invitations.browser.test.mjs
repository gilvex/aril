import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mkdirSync } from 'node:fs'
import { test } from 'node:test'
import { chromium } from 'playwright'
import { createSeed } from '@aril/domain/seed'
const requireStudio = createRequire(
  new URL('../apps/studio/package.json', import.meta.url),
)
const { preview } = await import(
  pathToFileURL(requireStudio.resolve('vite')).href
)
test('invitations: modal join, inbox decisions, searchable recipients, delivery failures and usernames on desktop/mobile', async (t) => {
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
  const capture = process.env.ARIL_CAPTURE_INVITATIONS === '1'
  const videoDirectory = fileURLToPath(
    new URL('../artifacts/invitations-recording/', import.meta.url),
  )
  if (capture) mkdirSync(videoDirectory, { recursive: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'en-US',
    serviceWorkers: 'block',
    ...(capture
      ? {
          recordVideo: {
            dir: videoDirectory,
            size: { width: 1280, height: 900 },
          },
        }
      : {}),
  })
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  const profile = {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Alex Morgan',
    username: 'user_00000000000040008000000000000001',
    avatar: '',
    color: '#426cbd',
  }
  const person = {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Maya Chen',
    username: 'maya_design',
    avatar: '',
  }
  const otherPerson = {
    ...person,
    id: 'fixture-sam',
    name: 'Sam Rivera',
    username: 'maya_research',
  }
  const workspace = createSeed()
  const studios = [
    {
      id: 'fixture',
      name: 'Design playground',
      role: 'owner',
      createdAt: '2026-10-21',
    },
  ]
  let invitations = [
    {
      id: 'invite-a',
      workspaceId: 'team',
      workspaceName: 'Orbit design system',
      inviterName: 'Maya Chen',
      role: 'member',
      expiresAt: Date.now() + 86400000,
    },
    {
      id: 'invite-b',
      workspaceId: 'review',
      workspaceName: 'Website review',
      inviterName: 'Sam Rivera',
      role: 'viewer',
      expiresAt: Date.now() + 86400000,
    },
  ]
  let failJoin = true,
    failSend = true,
    failUsername = true
  const requests = []
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url()),
      path = url.pathname
    if (url.origin !== origin) return route.abort()
    const json = (body) => route.fulfill({ json: body })
    if (path === '/api/deployment-settings')
      return json({ productSiteEnabled: false })
    if (path === '/api/session')
      return json({ profile, accountLinked: true, inviteRequired: false })
    if (path === '/api/auth/config') return json({ googleClientId: null })
    if (path === '/api/account')
      return json({
        accounts: [
          {
            provider: 'google',
            issuer: 'https://accounts.google.com',
            email: 'alex@example.test',
          },
        ],
        google: { email: 'alex@example.test' },
      })
    if (path === '/api/studios') return json(studios)
    if (path === '/api/studios/overview')
      return json(
        studios.map((item) => ({
          ...item,
          nodes: [],
          edges: [],
          members: [profile],
          memberCount: 1,
          boardCount: 1,
        })),
      )
    if (path === '/api/notifications') return json(invitations)
    if (path.startsWith('/api/notifications/')) {
      const [, , , id, decision] = path.split('/')
      assert.ok(['accept', 'decline'].includes(decision))
      const item = invitations.find((item) => item.id === id)
      invitations = invitations.filter((item) => item.id !== id)
      const studio = {
        id: item.workspaceId,
        name: item.workspaceName,
        role: item.role,
        createdAt: '2026-10-21',
      }
      if (decision === 'accept') studios.push(studio)
      return json(decision === 'accept' ? studio : { ok: true })
    }
    if (path === '/api/join') {
      if (failJoin)
        return route.fulfill({
          status: 403,
          json: { error: 'This invite is invalid, expired, or already used.' },
        })
      requests.push(route.request().postDataJSON())
      return json({ profile, token: '', workspaceId: 'fixture' })
    }
    if (path === '/api/username') {
      if (failUsername)
        return route.fulfill({
          status: 409,
          json: { error: 'That username is already taken.' },
        })
      profile.username = route.request().postDataJSON().username
      return json({ profile })
    }
    if (path === '/api/directory')
      return json(
        url.searchParams.get('q').includes('maya') ? [person, otherPerson] : [],
      )
    if (path === '/api/account-invitations') {
      requests.push(route.request().postDataJSON())
      return route.fulfill({
        status: 201,
        json: { id: 'sent-fixture', delivery: failSend ? 'failed' : 'sent' },
      })
    }
    if (path === '/api/workspace')
      return json({ workspace, revision: 1, savedAt: '2026-10-21' })
    if (path === '/api/workspace-access') return json({ role: 'owner' })
    if (path === '/api/members') return json([{ ...profile, role: 'owner' }])
    if (path === '/api/events')
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
      ].includes(path)
    )
      return json([])
    if (path.startsWith('/api/'))
      return route.fulfill({ status: 503, json: { error: 'Isolated fixture' } })
    return route.continue()
  })
  if (capture)
    await context.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const dot = document.createElement('div')
        dot.style.cssText =
          'position:fixed;left:0;top:0;width:14px;height:14px;border:2px solid white;border-radius:50%;background:#b34568;pointer-events:none;z-index:2147483647;transform:translate(-100px,-100px);transition:transform .12s ease-out'
        document.body.append(dot)
        document.addEventListener('pointermove', (event) => {
          dot.style.transform = `translate(${event.clientX - 7}px,${event.clientY - 7}px)`
        })
      })
    })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(origin + '/app')
  await page.getByRole('heading', { name: 'Choose your username' }).waitFor()
  const usernameInput = page.getByRole('textbox', {
    name: 'Username',
    exact: true,
  })
  assert.equal(await usernameInput.inputValue(), 'alex_morgan')
  if (capture) await page.waitForTimeout(900)
  if (capture)
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/username-setup.png',
          import.meta.url,
        ),
      ),
    })
  await page
    .getByRole('button', { name: 'Save and continue', exact: true })
    .click()
  await page.getByRole('alert').waitFor()
  assert.equal(await usernameInput.inputValue(), 'alex_morgan')
  await page.getByRole('button', { name: 'Suggest another username' }).click()
  assert.match(await usernameInput.inputValue(), /^alex_morgan_[a-z0-9]{6}$/)
  await usernameInput.fill('user_reserved')
  assert.equal(
    await page
      .getByRole('button', { name: 'Save and continue', exact: true })
      .isEnabled(),
    false,
  )
  await usernameInput.fill('Alex_Morgan')
  failUsername = false
  await page
    .getByRole('button', { name: 'Save and continue', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Choose your username' })
    .waitFor({ state: 'hidden' })
  assert.equal(profile.username, 'alex_morgan')
  await page.reload()
  await page
    .getByRole('button', { name: 'Notifications', exact: true })
    .waitFor()
  assert.equal(
    await page.getByRole('heading', { name: 'Choose your username' }).count(),
    0,
  )
  if (capture) await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Notifications', exact: true }).click()
  if (capture) await page.waitForTimeout(900)
  const dialog = page.getByRole('dialog')
  await dialog.getByText('Orbit design system', { exact: true }).waitFor()
  if (capture) {
    await page.waitForTimeout(700)
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/account-invitations.png',
          import.meta.url,
        ),
      ),
      animations: 'disabled',
    })
  }
  await dialog
    .getByRole('button', { name: 'Decline', exact: true })
    .last()
    .click()
  await dialog.getByText('Invitation declined.', { exact: true }).waitFor()
  if (capture) await page.waitForTimeout(900)
  await dialog.getByRole('button', { name: 'Accept', exact: true }).click()
  await dialog
    .getByText(
      'Invitation accepted. Your workspace is available in Workspaces.',
      { exact: true },
    )
    .waitFor()
  await page.keyboard.press('Escape')
  await page
    .getByRole('heading', { name: 'Orbit design system', exact: true })
    .waitFor()
  await page
    .getByRole('button', { name: 'Join workspace', exact: true })
    .click()
  await dialog
    .getByRole('textbox', { name: 'Invite link' })
    .fill(origin + '/app#invite=fixture-valid-invitation-token')
  await dialog
    .getByRole('button', { name: 'Join workspace', exact: true })
    .click()
  await dialog.getByRole('alert').waitFor()
  assert.match(
    await dialog.getByRole('textbox', { name: 'Invite link' }).inputValue(),
    /fixture-valid/,
  )
  failJoin = false
  await dialog
    .getByRole('button', { name: 'Join workspace', exact: true })
    .click()
  await dialog.waitFor({ state: 'hidden' })
  assert.equal(requests.at(-1).token, 'fixture-valid-invitation-token')
  await page.getByLabel('Your account', { exact: true }).click()
  assert.equal(
    await page.getByRole('textbox', { name: 'Username', exact: true }).count(),
    0,
  )
  await page
    .getByRole('button', { name: 'Account settings', exact: true })
    .click()
  failUsername = true
  await page
    .getByRole('textbox', { name: 'Username', exact: true })
    .fill('new_alex')
  await page.getByRole('button', { name: 'Save username', exact: true }).click()
  await page
    .getByText('That username is already taken.', { exact: true })
    .waitFor()
  failUsername = false
  await page.getByRole('button', { name: 'Save username', exact: true }).click()
  await page.getByText('@new_alex', { exact: true }).waitFor()
  if (capture)
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/account-settings.png',
          import.meta.url,
        ),
      ),
    })
  if (capture) await page.waitForTimeout(900)
  await page.goto(origin + '/w/fixture/settings?board=layers')
  await page
    .getByRole('textbox', { name: 'Email or username', exact: true })
    .fill('maya')
  const result = page.getByRole('button', { name: 'Maya Chen @maya_design' })
  await result.waitFor()
  const restingBackground = await result.evaluate(
    (node) => getComputedStyle(node).backgroundColor,
  )
  assert.equal(restingBackground, 'rgba(0, 0, 0, 0)')
  await result.hover()
  await page.waitForTimeout(250)
  assert.notEqual(
    await result.evaluate((node) => getComputedStyle(node).backgroundColor),
    restingBackground,
  )
  assert.ok(
    await page
      .locator('.invitation-results')
      .evaluate((node) => parseFloat(getComputedStyle(node).rowGap) >= 6),
  )
  if (capture)
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/invitation-search.png',
          import.meta.url,
        ),
      ),
    })
  await page.getByRole('button', { name: 'Maya Chen @maya_design' }).click()
  await page
    .getByRole('combobox', { name: 'Invitation role', exact: true })
    .click()
  await page.getByRole('option', { name: 'Viewer', exact: true }).click()
  await page
    .getByRole('button', { name: 'Send invitation', exact: true })
    .click()
  await page
    .getByText(
      'In-app invitation created, but email delivery failed. Please try again later.',
      { exact: true },
    )
    .waitFor()
  assert.deepEqual(requests.at(-1), { userId: person.id, role: 'viewer' })
  failSend = false
  await page
    .getByRole('textbox', { name: 'Email or username', exact: true })
    .fill('new@example.test')
  await page
    .getByRole('button', { name: 'Send invitation', exact: true })
    .click()
  await page
    .getByText('Invitation created and email sent.', { exact: true })
    .waitFor()
  assert.equal(requests.at(-1).email, 'new@example.test')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Notifications', exact: true }).click()
  await dialog.getByText('You are all caught up.', { exact: true }).waitFor()
  const box = await dialog.boundingBox()
  assert.ok(box.x >= 0 && box.x + box.width <= 391)
  await page.keyboard.press('Escape')
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  )
  assert.deepEqual(errors, [])
  await page.goto(origin + '/app')
  await page.getByLabel('Your account', { exact: true }).click()
  await page
    .getByRole('button', { name: 'Account settings', exact: true })
    .click()
  await dialog.getByRole('textbox', { name: 'Username', exact: true }).waitFor()
  const accountBox = await dialog.boundingBox()
  assert.ok(accountBox.x >= 0 && accountBox.x + accountBox.width <= 391)
  assert.equal(
    await dialog
      .getByRole('button', { name: 'Close dialog', exact: true })
      .count(),
    1,
  )
  await dialog
    .getByRole('textbox', { name: 'Username', exact: true })
    .scrollIntoViewIfNeeded()
  assert.equal(
    await dialog
      .getByRole('textbox', { name: 'Username', exact: true })
      .inputValue(),
    'new_alex',
  )
  if (capture) await page.waitForTimeout(450)
  if (capture)
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/account-settings-mobile.png',
          import.meta.url,
        ),
      ),
    })
  await dialog
    .getByRole('button', { name: 'Close dialog', exact: true })
    .click()
  profile.username = 'user_00000000000040008000000000000001'
  profile.name = 'Алексей'
  await page.goto(origin + '/app#invite=fixture-preserved-invitation')
  await page.reload()
  await page.getByRole('heading', { name: 'Choose your username' }).waitFor()
  assert.equal(await usernameInput.inputValue(), 'member')
  await page.getByRole('combobox', { name: 'Language', exact: true }).click()
  await page.getByRole('option', { name: 'Русский', exact: true }).click()
  await page
    .getByRole('heading', { name: 'Выберите имя пользователя' })
    .waitFor()
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  )
  if (capture)
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/username-setup-mobile.png',
          import.meta.url,
        ),
      ),
    })
  await page
    .getByRole('button', { name: 'Сохранить и продолжить', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Выберите имя пользователя' })
    .waitFor({ state: 'hidden' })
  assert.match(page.url(), /#invite=fixture-preserved-invitation$/)
  profile.username = 'user_00000000000040008000000000000001'
  profile.guestExpiresAt = Date.now() + 3600000
  await page.goto(origin + '/app')
  await page.reload()
  await page.getByLabel('Ваш аккаунт', { exact: true }).waitFor()
  assert.equal(
    await page
      .getByRole('heading', { name: 'Выберите имя пользователя' })
      .count(),
    0,
  )
  assert.deepEqual(errors, [])
  await context.close()
  if (capture) console.log('Invitation recording:', await page.video().path())
})
