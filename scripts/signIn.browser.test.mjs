import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { test } from 'node:test'
import { chromium } from 'playwright'

const requireStudio = createRequire(
  new URL('../apps/studio/package.json', import.meta.url),
)
const { createServer, preview } = await import(
  pathToFileURL(requireStudio.resolve('vite')).href
)
const root = fileURLToPath(new URL('../apps/studio', import.meta.url))

test(
  'sign-in language changes through real controls in dev and production',
  { timeout: 120000 },
  async (t) => {
    const browser = await chromium.launch({
      headless: true,
      channel: process.env.ARIL_TEST_BROWSER_CHANNEL || undefined,
    })
    t.after(() => browser.close())
    for (const mode of ['development', 'production']) {
      await t.test(mode, async (t) => {
        const server =
          mode === 'development'
            ? await createServer({
                root,
                server: { host: '127.0.0.1', port: 0, strictPort: false },
              })
            : await preview({
                root,
                preview: { host: '127.0.0.1', port: 0, strictPort: false },
              })
        if (mode === 'development') await server.listen()
        t.after(() =>
          mode === 'development'
            ? server.close()
            : new Promise((resolve) => server.httpServer.close(resolve)),
        )
        const origin = `http://127.0.0.1:${server.httpServer.address().port}`
        for (const productSiteEnabled of [false, true]) {
          const context = await browser.newContext({
            viewport: { width: 1440, height: 900 },
            locale: 'en-US',
            serviceWorkers: 'block',
          })
          t.after(() => context.close())
          let sessionCalls = 0
          await context.route('**/*', async (route) => {
            const url = new URL(route.request().url())
            if (url.origin !== origin) return route.abort()
            if (url.pathname === '/api/deployment-settings')
              return route.fulfill({
                json: {
                  productSiteEnabled,
                  productName: 'Fixture Studio',
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
              return route.fulfill({
                status: 401,
                json: { inviteRequired: true },
              })
            }
            if (url.pathname.startsWith('/api/')) return route.abort()
            return route.continue()
          })
          const page = await context.newPage()
          const errors = []
          await page.addInitScript(() => {
            window.signInFlashes = []
            addEventListener('DOMContentLoaded', () => {
              const observer = new MutationObserver(() => {
                const control = document.querySelector('.google-signin')
                if (control && !control.hidden)
                  window.signInFlashes.push(control.textContent)
              })
              observer.observe(document.body, {
                subtree: true,
                childList: true,
                characterData: true,
                attributes: true,
              })
            })
          })
          page.on('pageerror', (error) => errors.push(String(error)))
          await page.goto(origin + '/#invite=fixture-code')
          await page
            .getByRole('button', {
              name: 'Sign in with Company SSO',
              exact: true,
            })
            .waitFor()
          await page
            .getByRole('combobox', { name: 'Language', exact: true })
            .click()
          await page
            .getByRole('option', { name: 'Русский', exact: true })
            .click()
          await page
            .getByRole('heading', {
              name: 'Войти в Fixture Studio',
              exact: true,
            })
            .waitFor()
          await page
            .getByRole('button', { name: 'Войти через Яндекс ID', exact: true })
            .waitFor()
          await page
            .getByRole('combobox', { name: 'Язык', exact: true })
            .waitFor()
          assert.equal(
            await page.locator('.login-blueprint-heading strong').innerText(),
            'Схема развёртывания',
          )
          assert.equal(
            await page.evaluate(() =>
              localStorage.getItem('pomegranate-language'),
            ),
            'ru',
          )
          assert.equal(new URL(page.url()).hash, '#invite=fixture-code')
          assert.equal(
            sessionCalls,
            1,
            'switching language must not restart the session',
          )
          await page
            .getByRole('combobox', { name: 'Язык', exact: true })
            .click()
          await page
            .getByRole('option', { name: 'English', exact: true })
            .click()
          await page
            .getByRole('heading', {
              name: 'Sign in to Fixture Studio',
              exact: true,
            })
            .waitFor()
          await page
            .getByRole('combobox', { name: 'Language', exact: true })
            .click()
          await page
            .getByRole('option', { name: 'Русский', exact: true })
            .click()
          await page
            .getByRole('heading', {
              name: 'Войти в Fixture Studio',
              exact: true,
            })
            .waitFor()
          await page.reload()
          await page
            .getByRole('heading', {
              name: 'Войти в Fixture Studio',
              exact: true,
            })
            .waitFor()
          assert.equal(new URL(page.url()).hash, '#invite=fixture-code')
          await page.setViewportSize({ width: 390, height: 844 })
          await page
            .getByRole('combobox', { name: 'Язык', exact: true })
            .click()
          await page
            .getByRole('option', { name: 'English', exact: true })
            .click()
          await page
            .getByRole('heading', {
              name: 'Sign in to Fixture Studio',
              exact: true,
            })
            .waitFor()
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          )
          if (!productSiteEnabled)
            assert.equal(
              await page.locator('.project-links,.demo-entry').count(),
              0,
            )
          assert.deepEqual(
            await page.evaluate(() => window.signInFlashes),
            [],
            'disabled Google must never flash while switching languages',
          )
          assert.deepEqual(errors, [])
          await context.close()
        }
        const googleContext = await browser.newContext({
          locale: 'en-US',
          serviceWorkers: 'block',
        })
        t.after(() => googleContext.close())
        await googleContext.route('**/*', async (route) => {
          const url = new URL(route.request().url())
          if (
            url.hostname === 'accounts.google.com' &&
            url.pathname === '/gsi/client'
          ) {
            return route.fulfill({
              contentType: 'text/javascript',
              body: `window.google={accounts:{id:{initialize:()=>{},renderButton:(root,options)=>{const button=document.createElement('button');button.dataset.googleTheme=options.theme;button.textContent=options.locale==='ru'?'Войти через Google':'Sign in with Google';root.append(button)}}}}`,
            })
          }
          if (url.origin !== origin) return route.abort()
          if (url.pathname === '/api/deployment-settings')
            return route.fulfill({ json: { productSiteEnabled: false } })
          if (url.pathname === '/api/auth/config')
            return route.fulfill({
              json: {
                googleClientId: 'fixture-client',
                yandexEnabled: false,
                oidcEnabled: false,
              },
            })
          if (url.pathname === '/api/auth/google/challenge')
            return route.fulfill({
              json: { challenge: 'a'.repeat(43), nonce: 'b'.repeat(43) },
            })
          if (url.pathname === '/api/session')
            return route.fulfill({
              status: 401,
              json: { inviteRequired: true },
            })
          if (url.pathname.startsWith('/api/')) return route.abort()
          return route.continue()
        })
        const googlePage = await googleContext.newPage()
        await googlePage.goto(origin)
        await googlePage
          .getByRole('button', { name: 'Sign in with Google', exact: true })
          .waitFor()
        assert.ok(
          await googlePage.locator('.google-signin').isVisible(),
          'initialized Google button must remain mounted',
        )
        await googlePage
          .getByRole('combobox', { name: 'Language', exact: true })
          .click()
        await googlePage
          .getByRole('option', { name: 'Русский', exact: true })
          .click()
        await googlePage
          .getByRole('button', { name: 'Войти через Google', exact: true })
          .waitFor()
        assert.ok(await googlePage.locator('.google-signin').isVisible())
        for (const [theme, expected] of [
          ['dark', 'filled_black'],
          ['light', 'outline'],
        ]) {
          await googlePage.evaluate((value) => {
            document.documentElement.dataset.theme = value
          }, theme)
          await googlePage
            .locator(`[data-google-theme="${expected}"]`)
            .waitFor()
        }
        await googleContext.close()
      })
    }
  },
)
