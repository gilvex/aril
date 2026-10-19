import assert from 'node:assert/strict'
import { test } from 'node:test'
import { productBranding } from './utils/productBranding.ts'
import { loadDeploymentSettings } from '../src/shared/deploymentSettings/utils/loadDeploymentSettings.ts'
import { getProductBranding } from '../src/shared/deploymentSettings/utils/getProductBranding.ts'

test('branding supports custom name and HTTP(S) or root-relative logos with safe defaults', () => {
  const oldName = process.env.ARIL_PRODUCT_NAME,
    oldLogo = process.env.ARIL_PRODUCT_LOGO_URL
  try {
    delete process.env.ARIL_PRODUCT_NAME
    delete process.env.ARIL_PRODUCT_LOGO_URL
    assert.deepEqual(productBranding(), {
      productName: 'Aril',
      productLogoUrl: '/aril.svg',
    })
    process.env.ARIL_PRODUCT_NAME = '  Company Studio  '
    for (const logo of [
      'https://company.example/logo.svg',
      'http://intranet/logo.png',
      '/brand/logo.svg',
    ]) {
      process.env.ARIL_PRODUCT_LOGO_URL = logo
      assert.deepEqual(productBranding(), {
        productName: 'Company Studio',
        productLogoUrl: logo,
      })
    }
    for (const logo of [
      'javascript:alert(1)',
      'data:image/svg+xml,test',
      '//other.example/logo.svg',
      'https://user:secret@example.test/logo.png',
      'logo.svg',
    ]) {
      process.env.ARIL_PRODUCT_LOGO_URL = logo
      assert.equal(productBranding().productLogoUrl, '/aril.svg')
    }
    process.env.ARIL_PRODUCT_NAME = 'x'.repeat(100)
    assert.equal(productBranding().productName.length, 80)
  } finally {
    if (oldName === undefined) delete process.env.ARIL_PRODUCT_NAME
    else process.env.ARIL_PRODUCT_NAME = oldName
    if (oldLogo === undefined) delete process.env.ARIL_PRODUCT_LOGO_URL
    else process.env.ARIL_PRODUCT_LOGO_URL = oldLogo
  }
})

test('frontend applies runtime branding and resets it to defaults on unavailable configuration', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({
      productSiteEnabled: false,
      productName: 'Company Studio',
      productLogoUrl: '/brand/logo.svg',
    }),
  )
  await loadDeploymentSettings()
  assert.deepEqual(getProductBranding(), {
    productName: 'Company Studio',
    productLogoUrl: '/brand/logo.svg',
  })
  mock.mock.mockImplementation(async () => {
    throw new Error('Unavailable')
  })
  await loadDeploymentSettings()
  assert.deepEqual(getProductBranding(), {
    productName: 'Aril',
    productLogoUrl: '/aril.svg',
  })
})
