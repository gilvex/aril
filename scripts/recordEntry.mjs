import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mkdir, copyFile, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { chromium } from 'playwright'

// Public media uses generated fixtures only; never connect this script to a live API.
const requireStudio = createRequire(
  new URL('../apps/studio/package.json', import.meta.url),
)
const { preview } = await import(
  pathToFileURL(requireStudio.resolve('vite')).href
)
const root = fileURLToPath(new URL('../apps/studio', import.meta.url))
const output = fileURLToPath(
  new URL('../artifacts/entry-recording', import.meta.url),
)
const media = root + '/public/changelog'
await mkdir(output, { recursive: true })
const server = await preview({
  root,
  preview: { host: '127.0.0.1', port: 0, strictPort: false },
})
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const browser = await chromium.launch({ headless: true })
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    colorScheme: 'dark',
    serviceWorkers: 'block',
    recordVideo: { dir: output, size: { width: 1440, height: 900 } },
  })
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.abort()
    if (url.pathname === '/api/deployment-settings')
      return route.fulfill({
        json: {
          productSiteEnabled: true,
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
    if (url.pathname === '/api/session')
      return route.fulfill({ status: 401, json: { inviteRequired: true } })
    if (url.pathname.startsWith('/api/')) return route.abort()
    return route.continue()
  })
  await context.addInitScript(() => {
    addEventListener('DOMContentLoaded', () => {
      const pointer = document.createElement('div')
      pointer.style.cssText =
        'position:fixed;left:0;top:0;width:14px;height:14px;background:white;border:2px solid #171717;border-radius:50%;pointer-events:none;z-index:2147483647;transform:translate(-40px,-40px)'
      document.body.append(pointer)
      addEventListener(
        'mousemove',
        (event) =>
          (pointer.style.transform = `translate(${event.clientX - 7}px,${event.clientY - 7}px)`),
      )
    })
  })
  const page = await context.newPage()
  const click = async (locator) => {
    const rect = await locator.boundingBox()
    if (!rect) throw new Error('Recording target missing')
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2, {
      steps: 28,
    })
    await page.waitForTimeout(300)
    await locator.click()
  }
  await page.goto(origin)
  await page.locator('.landing-page').waitFor()
  await page.waitForTimeout(1400)
  await page.mouse.move(650, 560, { steps: 25 })
  await page.mouse.wheel(0, 380)
  await page.waitForTimeout(900)
  await page.mouse.wheel(0, -380)
  await page.waitForTimeout(700)
  await click(page.getByRole('link', { name: 'Sign in', exact: true }))
  await page
    .getByRole('button', { name: 'Sign in with Company SSO', exact: true })
    .waitFor()
  await page.waitForTimeout(700)
  await page.screenshot({ path: media + '/studio-entry.png' })
  await click(page.getByRole('combobox', { name: 'Language', exact: true }))
  await page.waitForTimeout(450)
  await click(page.getByRole('option', { name: 'Русский', exact: true }))
  await page.waitForTimeout(1000)
  await click(page.getByRole('combobox', { name: 'Язык', exact: true }))
  await click(page.getByRole('option', { name: 'English', exact: true }))
  const link = await page.locator('.source-code-link').boundingBox()
  await page.mouse.move(link.x + link.width / 2, link.y + link.height / 2, {
    steps: 35,
  })
  await page.waitForTimeout(1400)
  const video = page.video()
  await context.close()
  const path = await video.path()
  await copyFile(path, output + '/entry.webm')
  const encoder = process.env.ARIL_FFMPEG || 'ffmpeg'
  for (const [format, args] of [
    [
      'mp4',
      [
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-crf',
        '24',
        '-movflags',
        '+faststart',
      ],
    ],
    [
      'gif',
      [
        '-filter_complex',
        'fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff:max_colors=128[p];[b][p]paletteuse=dither=bayer',
        '-loop',
        '0',
      ],
    ],
  ]) {
    const result = spawnSync(
      encoder,
      [
        '-y',
        '-loglevel',
        'error',
        '-i',
        path,
        ...args,
        media + '/studio-entry.' + format,
      ],
      { encoding: 'utf8', windowsHide: true },
    )
    if (result.status !== 0)
      throw new Error(result.stderr || String(result.error))
  }
  for (const [locale, text] of [
    [
      'en',
      'Fixture recording: open the studio from the public home, change language, and find the source-code link.',
    ],
    [
      'ru',
      'Тестовая запись: переход с сайта в студию, смена языка и ссылка на исходный код.',
    ],
  ])
    await writeFile(
      media + `/studio-entry.mp4.${locale}.vtt`,
      `WEBVTT\n\n00:00.000 --> 00:30.000\n${text}\n`,
    )
  console.log('Recorded studio entry using isolated fixtures.')
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
