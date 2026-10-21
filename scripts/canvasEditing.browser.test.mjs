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

test('canvas tools, drawing selection, layout-independent history and agent access', async (t) => {
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
    viewport: { width: 1680, height: 1050 },
    locale: 'en-US',
    colorScheme: 'dark',
    serviceWorkers: 'block',
    ...(process.env.ARIL_CAPTURE_EDITING === '1'
      ? {
          recordVideo: {
            dir: 'artifacts/canvas-editing',
            size: { width: 1680, height: 1050 },
          },
        }
      : {}),
  })
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.origin === origin && url.pathname === '/api/deployment-settings')
      return route.fulfill({ json: { productSiteEnabled: true } })
    return url.origin === origin && !url.pathname.startsWith('/api/')
      ? route.continue()
      : route.abort()
  })
  const workspace = createSeed()
  const kinds = [
    'internet',
    'firewall',
    'router',
    'switch',
    'network',
    'accessPoint',
    'device',
    'server',
    'person',
  ]
  const names = [
    'Internet',
    'Perimeter firewall',
    'Office router',
    'Core switch',
    'Office subnet',
    'Office Wi-Fi',
    'Workstation',
    'File server',
    'Network operator',
  ]
  const nodes = kinds.map((kind, index) => ({
    id: 'fixture-' + kind,
    type: 'idea',
    position: { x: (index % 4) * 320, y: Math.floor(index / 4) * 250 },
    data: {
      kind:
        kind === 'person' ? 'person' : kind === 'server' ? 'server' : 'block',
      icon: kind === 'accessPoint' ? 'wifi' : kind === 'person' ? 'user' : kind,
      title: names[index],
      description: 'Demo network equipment\nOffice · example configuration',
      notes: '',
      requirements: [],
      status: 'Decided',
      ...(kind === 'person'
        ? {}
        : {
            network: {
              address:
                kind === 'internet' ? '203.0.113.1' : '192.0.2.' + (index + 1),
              hostname: kind + '.example.test',
              vlan: '10',
              location: 'Demo office',
            },
          }),
    },
  }))
  workspace.boards = [
    {
      id: 'network',
      name: 'Office network · demo',
      description: 'Example topology using documentation addresses only.',
      nodes,
      edges: [
        ['internet', 'firewall'],
        ['firewall', 'router'],
        ['router', 'switch'],
        ['switch', 'server'],
        ['switch', 'device'],
        ['switch', 'accessPoint'],
        ['accessPoint', 'network'],
      ].map(([from, to]) => ({
        id: from + '-' + to,
        source: 'fixture-' + from,
        target: 'fixture-' + to,
        type: 'smoothstep',
        label: 'Ethernet',
      })),
    },
  ]
  workspace.requirements = [
    {
      id: 'R-NET',
      title: 'Network requirement',
      description: '',
      category: 'Operations',
      priority: 'Must have',
      status: 'Captured',
      acceptance: '',
    },
  ]
  workspace.notesTitle = 'Network notes'
  workspace.documents = []
  await context.addInitScript((workspace) => {
    if (!sessionStorage.getItem('aril-demo-v1'))
      sessionStorage.setItem(
        'aril-demo-v1',
        JSON.stringify({
          envelope: {
            workspace,
            revision: 1,
            savedAt: '2026-10-19T10:00:00.000Z',
          },
          history: [],
        }),
      )
  }, workspace)

  if (process.env.ARIL_CAPTURE_EDITING === '1')
    await context.addInitScript(() => {
      addEventListener('DOMContentLoaded', () => {
        const cursor = document.createElement('div')
        cursor.style.cssText =
          'position:fixed;width:12px;height:12px;border:2px solid white;border-radius:50%;background:#b34568;z-index:2147483647;pointer-events:none;transform:translate(-30px,-30px)'
        document.body.append(cursor)
        addEventListener('mousemove', (event) => {
          cursor.style.left = event.clientX + 'px'
          cursor.style.top = event.clientY + 'px'
          cursor.style.transform = 'translate(-50%,-50%)'
        })
      })
    })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const button = (name) => page.getByRole('button', { name, exact: true })
  await page.goto(origin + '/?demo=1&workspace=demo&board=network&view=canvas')
  await button('Fit view').click()
  assert.equal(await button('Connect tool').count(), 0)
  await button('Universal block').waitFor()
  await page.locator('.react-flow__node[data-id="fixture-person"]').dblclick()
  assert.equal(await button('Node icon').count(), 0)
  assert.equal(
    await page
      .locator('.react-flow__node[data-id="fixture-person"] .node-icon')
      .count(),
    0,
  )
  await button('Close board details').click()
  await page.getByLabel('Hand-drawn', { exact: true }).click()
  await button('Pencil').click()
  await page.mouse.move(600, 560)
  await page.mouse.down()
  await page.mouse.move(830, 620, { steps: 18 })
  await page.mouse.up()
  await page.mouse.move(620, 660)
  await page.mouse.down()
  await page.mouse.move(850, 690, { steps: 18 })
  await page.mouse.up()
  await button('Select tool').click()
  await page.waitForFunction(
    () =>
      Object.keys(
        JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
          .boards[0].strokes || {},
      ).length === 2,
  )
  const stroke = page.locator('.drawing-stroke-hit').first()
  const point = await stroke.evaluate((el) => {
    const p = el.getPointAtLength(el.getTotalLength() / 2)
    const v = new DOMPoint(p.x, p.y).matrixTransform(el.getScreenCTM())
    return { x: v.x, y: v.y }
  })
  await page.mouse.click(point.x, point.y)
  assert.equal(await stroke.getAttribute('aria-pressed'), 'true')
  if (process.env.ARIL_CAPTURE_EDITING === '1') {
    await page.screenshot({
      path: 'apps/studio/public/changelog/canvas-editing.png',
    })
    await page.waitForTimeout(1200)
  }
  await page.keyboard.press('Delete')
  await page.waitForFunction(
    () =>
      Object.keys(
        JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
          .boards[0].strokes || {},
      ).length === 1,
  )
  // Russian layout still uses the physical Z key.
  await page.evaluate(() =>
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'я',
        code: 'KeyZ',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    ),
  )
  await page.waitForFunction(
    () =>
      Object.keys(
        JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
          .boards[0].strokes || {},
      ).length === 2,
  )
  await page.keyboard.press('Control+y')
  await page.waitForFunction(
    () =>
      Object.keys(
        JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
          .boards[0].strokes || {},
      ).length === 1,
  )
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    () =>
      Object.keys(
        JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
          .boards[0].strokes || {},
      ).length === 2,
  )
  await page.keyboard.press('Control+Shift+z')
  await page.waitForFunction(
    () =>
      Object.keys(
        JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
          .boards[0].strokes || {},
      ).length === 1,
  )
  const remaining = page.locator('.drawing-stroke-hit').first()
  await remaining.focus()
  await page.keyboard.press('Enter')
  await button('Delete selected drawing').click()
  await page.waitForFunction(
    () =>
      Object.keys(
        JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
          .boards[0].strokes || {},
      ).length === 0,
  )
  assert.equal(await page.locator('.react-flow__node').count(), 9)
  await page.getByLabel('Shapes', { exact: true }).click()
  await button('Universal block').click()
  await page.waitForFunction(
    () =>
      JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
        .boards[0].nodes.length === 10,
  )
  const addedId = await page.evaluate(
    () =>
      JSON.parse(
        sessionStorage.getItem('aril-demo-v1'),
      ).envelope.workspace.boards[0].nodes.at(-1).id,
  )
  await page.locator('.react-flow__node[data-id="' + addedId + '"]').dblclick()
  await button('Node icon').waitFor()
  await button('Settings').click()
  await button('Agent access').click()
  await page
    .getByText('Run setup in your local Aril checkout', { exact: true })
    .waitFor()
  await page
    .getByRole('textbox', { name: 'Connection name' })
    .fill('Demo assistant')
  assert.equal(await page.locator('.agent-setup pre').count(), 2)
  if (process.env.ARIL_CAPTURE_EDITING === '1') {
    await page.screenshot({
      path: 'apps/studio/public/changelog/agent-access-readable.png',
    })
    await page.waitForTimeout(1500)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.agent-setup').scrollIntoViewIfNeeded()
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  )
  if (process.env.ARIL_CAPTURE_EDITING === '1')
    await page.screenshot({ path: 'artifacts/agent-access-mobile.png' })
  assert.deepEqual(errors, [])
  await context.close()
  if (process.env.ARIL_CAPTURE_EDITING === '1')
    console.log('Recording:', await page.video().path())
})
