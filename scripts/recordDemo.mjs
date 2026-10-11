import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Only the isolated, local frontend demo is permitted for public recordings.
const origin = 'http://127.0.0.1:4173'
const output = resolve('artifacts/demo-recording')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'en-US',
  colorScheme: 'dark',
  recordVideo: { dir: output, size: { width: 1440, height: 900 } },
})
await context.route('**/*', async (route) => {
  const url = new URL(route.request().url())
  if (url.origin === origin && !url.pathname.startsWith('/api/'))
    return route.continue()
  if (['data:', 'blob:'].includes(url.protocol)) return route.continue()
  return route.abort()
})
await context.addInitScript(() => {
  // A visible pointer for the screencast; interactions still use real mouse events.
  addEventListener('DOMContentLoaded', () => {
    const pointer = document.createElement('div')
    pointer.style.cssText =
      'position:fixed;left:0;top:0;width:14px;height:14px;background:#fff;border:2px solid #171717;border-radius:50%;box-shadow:0 0 0 3px #fff5;pointer-events:none;z-index:2147483647;transform:translate(-40px,-40px)'
    document.body.append(pointer)
    addEventListener('mousemove', (event) => {
      pointer.style.transform = `translate(${event.clientX - 7}px,${event.clientY - 7}px)`
    })
    addEventListener('mousedown', () => {
      pointer.style.background = '#ef92b2'
    })
    addEventListener('mouseup', () => {
      pointer.style.background = '#fff'
    })
  })
})
const page = await context.newPage()
const recordingStarted = Date.now()
const marks = {}
const pause = (ms) => page.waitForTimeout(ms)
const click = async (locator) => {
  await locator.waitFor({ state: 'visible' })
  const box = await locator.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 30,
  })
  await pause(180)
  await locator.click()
  await pause(800)
}
const button = (name) => page.getByRole('button', { name, exact: true })
try {
  await page.goto(origin + '/?demo=1')
  await button('Show board details').waitFor()
  await click(button('Library'))
  await click(button('Add example kit'))
  await click(button('Canvas'))
  await click(button('Fit view'))
  await pause(700)
  marks.start = (Date.now() - recordingStarted) / 1000
  await pause(1200)
  await page.mouse.move(650, 280, { steps: 20 })
  await page.mouse.down()
  for (let i = 1; i <= 40; i++) {
    await page.mouse.move(650 + i * 2, 280 + i * 0.5)
    await pause(16)
  }
  await page.mouse.up()
  await click(button('Show board details'))
  await pause(1400)
  await click(button('Close board details'))
  await click(button('Design direction'))
  await button('Layers').waitFor()
  await pause(1400)
  await click(button('Layers'))
  await pause(1300)
  await click(button('Close layers'))
  await click(button('Library'))
  await button('Expand Core UI').waitFor()
  marks.library = (Date.now() - recordingStarted) / 1000
  await pause(1200)
  await click(button('Expand Core UI'))
  await click(button('Fit View'))
  await pause(1400)
  await click(page.getByText('Deploy button', { exact: true }))
  marks.details = (Date.now() - recordingStarted) / 1000
  await page
    .getByRole('complementary', { name: 'Asset details', exact: true })
    .waitFor()
  await pause(1000)
  const resize = page.getByRole('separator', {
    name: 'Resize Asset details width',
    exact: true,
  })
  await resize.focus()
  for (let i = 0; i < 5; i++) {
    await resize.press('Shift+ArrowLeft')
    await pause(90)
  }
  await pause(1200)
  const grip = page.getByRole('button', { name: 'Move window', exact: true })
  const gripBox = await grip.boundingBox()
  await page.mouse.move(
    gripBox.x + gripBox.width / 2,
    gripBox.y + gripBox.height / 2,
    { steps: 25 },
  )
  await page.mouse.down()
  for (let i = 1; i <= 45; i++) {
    await page.mouse.move(
      gripBox.x + gripBox.width / 2 - i * 2.4,
      gripBox.y + gripBox.height / 2 + i * 0.6,
    )
    await pause(16)
  }
  await page.mouse.up()
  await pause(1000)
  await click(
    page.getByRole('combobox', { name: 'Preview variant', exact: true }),
  )
  await click(page.getByRole('option', { name: 'Loading', exact: true }))
  await pause(1200)
  await click(button('color/action/primary Deploy button · fill'))
  await pause(1200)
  await click(page.getByRole('radio', { name: 'Usage 2', exact: true }))
  await pause(1000)
  await click(page.getByRole('textbox', { name: 'Search usages', exact: true }))
  await page
    .getByRole('textbox', { name: 'Search usages', exact: true })
    .pressSequentially('loading', { delay: 150 })
  await pause(1800)
  await page.screenshot({ path: resolve(output, 'recording-proof.png') })
  marks.end = (Date.now() - recordingStarted) / 1000
} finally {
  const video = page.video()
  await context.close()
  await browser.close()
  marks.file = await video.path()
  await writeFile(
    resolve(output, 'timing.json'),
    JSON.stringify(marks, null, 2),
  )
  console.log(marks)
}
