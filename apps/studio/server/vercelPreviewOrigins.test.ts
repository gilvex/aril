import assert from 'node:assert/strict'
import { test } from 'node:test'
import { vercelPreviewOrigins } from './utils/vercelPreviewOrigins.ts'

const preview = {
  VERCEL: '1',
  VERCEL_ENV: 'preview',
  VERCEL_URL: 'arilapp-deployment-team.vercel.app',
  VERCEL_BRANCH_URL: 'arilapp-git-011-skaneprimes-projects.vercel.app',
}

test('preview origins include the exact deployment and branch hosts', () => {
  assert.deepEqual(vercelPreviewOrigins(preview), [
    `https://${preview.VERCEL_URL}`,
    `https://${preview.VERCEL_BRANCH_URL}`,
  ])
  assert.deepEqual(
    vercelPreviewOrigins({
      ...preview,
      VERCEL_URL: preview.VERCEL_BRANCH_URL.toUpperCase(),
    }),
    [`https://${preview.VERCEL_BRANCH_URL}`],
  )
  assert.deepEqual(
    vercelPreviewOrigins({
      ...preview,
      VERCEL_BRANCH_URL: undefined,
    }),
    [`https://${preview.VERCEL_URL}`],
  )
})

test('local and production environments do not automatically admit preview hosts', () => {
  assert.deepEqual(vercelPreviewOrigins({}), [])
  assert.deepEqual(vercelPreviewOrigins({ ...preview, VERCEL: undefined }), [])
  for (const VERCEL_ENV of ['production', 'development', undefined]) {
    assert.deepEqual(vercelPreviewOrigins({ ...preview, VERCEL_ENV }), [])
  }
})

test('preview metadata cannot add wildcard, non-Vercel or malformed origins', () => {
  for (const host of [
    undefined,
    '',
    'unrelated.example',
    '*.vercel.app',
    'vercel.app',
    'preview.vercel.app.evil.example',
    'preview.vercel.app/path',
    'preview.vercel.app?query',
    'preview.vercel.app#hash',
    'preview.vercel.app:443',
    'https://preview.vercel.app',
    'user:secret@preview.vercel.app',
    'nested.preview.vercel.app',
    '-preview.vercel.app',
    'preview-.vercel.app',
    'preview.vercel.app\n',
  ]) {
    assert.deepEqual(
      vercelPreviewOrigins({
        ...preview,
        VERCEL_URL: host,
        VERCEL_BRANCH_URL: host,
      }),
      [],
      String(host),
    )
  }
})
