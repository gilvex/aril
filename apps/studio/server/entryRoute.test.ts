import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveEntryRoute } from '../src/app/utils/resolveEntryRoute.ts'
import { productSiteEnabled } from './utils/productSiteEnabled.ts'

test('public landing and studio routes stay separate without losing legacy entry links', () => {
  assert.equal(resolveEntryRoute('https://aril.studio/', true).page, 'landing')
  assert.equal(
    resolveEntryRoute('https://aril.studio/#studio', true).page,
    'landing',
  )
  for (const path of ['/app', '/app/', '/w/team/design'])
    assert.equal(
      resolveEntryRoute('https://aril.studio' + path, true).page,
      'studio',
    )
  for (const suffix of [
    '#invite=abc',
    '#guest=abc',
    '#transfer=abc',
    '?account=switch',
    '?authError=oidc',
    '?demo=1&workspace=demo',
    '?workspace=team&board=a',
  ]) {
    const result = resolveEntryRoute('https://aril.studio/' + suffix, true)
    assert.deepEqual(result, { page: 'studio', href: '/app' + suffix })
  }
  assert.deepEqual(resolveEntryRoute('https://self.example/', false), {
    page: 'studio',
    href: '/app',
  })
  assert.deepEqual(
    resolveEntryRoute('https://self.example/changelog#old', false),
    { page: 'studio', href: '/app' },
  )
  assert.deepEqual(
    resolveEntryRoute(
      'https://self.example/w/demo/design?demo=1&board=layers',
      false,
    ),
    { page: 'studio', href: '/app' },
  )
})

test('only the configured official origin enables the product site by default', (t) => {
  const previous = process.env.ARIL_PRODUCT_SITE_ENABLED
  t.after(() => {
    if (previous === undefined) delete process.env.ARIL_PRODUCT_SITE_ENABLED
    else process.env.ARIL_PRODUCT_SITE_ENABLED = previous
  })
  delete process.env.ARIL_PRODUCT_SITE_ENABLED
  for (const origin of [
    undefined,
    'http://localhost:4317',
    'https://company.example',
    'https://aril.studio.evil.test',
  ])
    assert.equal(productSiteEnabled(origin), false)
  assert.equal(productSiteEnabled('https://aril.studio'), true)
  assert.equal(productSiteEnabled('https://www.aril.studio'), true)
  process.env.ARIL_PRODUCT_SITE_ENABLED = 'false'
  assert.equal(productSiteEnabled('https://aril.studio'), false)
  process.env.ARIL_PRODUCT_SITE_ENABLED = 'true'
  assert.equal(productSiteEnabled('http://localhost:4317'), true)
})
