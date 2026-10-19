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

test('canvas preserves empty titles, multiline descriptions, icons and native node copy/paste', async (t) => {
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
  const page = await context.newPage()
  const button = (name) => page.getByRole('button', { name, exact: true })
  await page.goto(origin + '/?demo=1&workspace=demo&board=network&view=canvas')
  await button('Fit view').waitFor()
  await button('Fit view').click()
  assert.equal(
    await page
      .locator('.react-flow__node[data-id="fixture-server"] .node-kind')
      .innerText(),
    'Block',
  )
  await page.locator('.react-flow__node[data-id="fixture-person"]').dblclick()
  const title = page.getByRole('textbox', { name: 'Node title', exact: true })
  await title.waitFor()
  await title.fill('')
  assert.equal(await title.inputValue(), '')
  await title.press('Tab')
  await page.waitForFunction(
    () =>
      JSON.parse(
        sessionStorage.getItem('aril-demo-v1'),
      ).envelope.workspace.boards[0].nodes.find(
        (n) => n.id === 'fixture-person',
      ).data.title === '',
  )
  await title.fill('Network operator')
  await button('Delete node').click()
  await page.locator('.react-flow__node[data-id="fixture-router"]').dblclick()
  assert.equal(
    await page
      .getByRole('textbox', { name: 'IP address / subnet', exact: true })
      .count(),
    0,
  )
  const description = page.getByRole('textbox', {
    name: 'Node description',
    exact: true,
  })
  await description.fill('Primary gateway\nIP: 192.0.2.1/24\nVLAN: 10')
  await description.press('Tab')
  await page.getByRole('combobox', { name: 'Node icon', exact: true }).click()
  await page.getByRole('option', { name: 'Router', exact: true }).click()
  await page.waitForFunction(
    () =>
      JSON.parse(
        sessionStorage.getItem('aril-demo-v1'),
      ).envelope.workspace.boards[0].nodes.find(
        (n) => n.id === 'fixture-router',
      ).data.icon === 'router',
  )
  assert.equal(
    await page
      .locator('.react-flow__node[data-id="fixture-router"] .idea-node > p')
      .first()
      .evaluate((node) => getComputedStyle(node).whiteSpace),
    'pre-wrap',
  )
  await button('Fit view').click()
  if (process.env.ARIL_CAPTURE_NETWORK === '1')
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../apps/studio/public/changelog/network-canvas.png',
          import.meta.url,
        ),
      ),
      animations: 'disabled',
    })
  await page.getByLabel('Shapes', { exact: true }).click()
  await button('Add node').click()
  assert.ok(
    await page
      .getByRole('menuitem', { name: 'Block', exact: true })
      .isVisible(),
  )
  assert.equal(
    await page.getByRole('menuitem', { name: 'Router', exact: true }).count(),
    0,
  )
  await page.getByRole('menuitem', { name: 'Block', exact: true }).click()
  await page.waitForFunction(
    () =>
      JSON.parse(
        sessionStorage.getItem('aril-demo-v1'),
      ).envelope.workspace.boards[0].nodes.filter(
        (n) => n.data.kind === 'block',
      ).length === 9,
  )
  await page.locator('.react-flow__node[data-id="fixture-router"]').click()
  const beforeCopy = await page.evaluate(
    () =>
      JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
        .boards[0].nodes.length,
  )
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const textTitle = page.getByRole('textbox', {
    name: 'Node title',
    exact: true,
  })
  await textTitle.focus()
  await textTitle.press('Control+a')
  await textTitle.press('Control+c')
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    'Office router',
  )
  await textTitle.press('Control+v')
  assert.equal(await textTitle.inputValue(), 'Office router')
  await page.locator('.react-flow__node[data-id="fixture-router"]').click()
  await page.keyboard.press('Control+c')
  const clipboard = await page.evaluate(() => navigator.clipboard.readText())
  assert.equal(JSON.parse(clipboard).format, 'aril-canvas')
  await page.keyboard.press('Control+v')
  await page.waitForFunction(
    (count) =>
      JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
        .boards[0].nodes.length ===
      count + 1,
    beforeCopy,
  )
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    (count) =>
      JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
        .boards[0].nodes.length === count,
    beforeCopy,
  )
  await page
    .locator(
      '.react-flow__edge[data-id="internet-firewall"] .react-flow__edge-textbg',
    )
    .dblclick()
  assert.equal(
    await page.locator('.inspector-body > p.muted').innerText(),
    'Connects to Perimeter firewall',
  )
  await button('Project notes').click()
  const note = page.getByRole('textbox', { name: 'Note title', exact: true })
  await note.fill('')
  await note.press('Tab')
  await page.waitForFunction(
    () =>
      JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
        .notesTitle === '',
  )
  assert.equal(await note.inputValue(), '')
  await note.fill('Network documentation')
  await button('Scope').click()
  await page.getByText('Network requirement', { exact: true }).click()
  const requirement = page.getByRole('textbox', {
    name: 'Requirement title',
    exact: true,
  })
  await requirement.fill('')
  assert.equal(await requirement.inputValue(), '')
  await requirement.press('Tab')
  await page.waitForFunction(
    () =>
      JSON.parse(sessionStorage.getItem('aril-demo-v1')).envelope.workspace
        .requirements[0].title === '',
  )
  await page.reload()
  await button('Canvas').click()
  await button('Fit view').click()
  await page.locator('.react-flow__node[data-id="fixture-router"]').dblclick()
  assert.equal(
    await page
      .getByRole('textbox', { name: 'Node description', exact: true })
      .inputValue(),
    'Primary gateway\nIP: 192.0.2.1/24\nVLAN: 10',
  )
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  )
})
