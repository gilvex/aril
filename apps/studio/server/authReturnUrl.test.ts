import assert from 'node:assert/strict'
import { test } from 'node:test'
import { authReturnUrl } from './utils/authReturnUrl.ts'

test('OAuth returns stay on origin, fit the flow cookie, and preserve invitation links', () => {
  const origin = 'https://studio.example.test'
  assert.equal(
    authReturnUrl('/?account=switch#invite=fixture', origin).href,
    origin + '/?account=switch#invite=fixture',
  )
  for (const candidate of [
    'https://attacker.test/',
    '//attacker.test/',
    '/\\attacker.test/',
    '/\n/attacker.test/',
    '/' + 'я'.repeat(1000),
    undefined,
  ]) {
    assert.equal(authReturnUrl(candidate, origin).href, origin + '/')
  }
})
