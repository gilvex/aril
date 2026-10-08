import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { mkdir, copyFile, readFile } from 'node:fs/promises'
const manifest = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
)
await mkdir('.server/certs', { recursive: true })
await copyFile('server/certs/supabase-ca.crt', '.server/certs/supabase-ca.crt')
await build({
  entryPoints: ['server/vercelHandler.ts'],
  outfile: '.server/index.mjs',
  bundle: true,
  // Shared workspace code is bundled here, so its private dependencies must be
  // bundled too. Only this deployable package's dependencies can stay external.
  external: Object.keys(manifest.dependencies).filter(
    (name) => name !== '@pomegranate/domain',
  ),
  alias: {
    '@pomegranate/domain': fileURLToPath(
      new URL('../../../packages/domain/src', import.meta.url),
    ),
  },
  platform: 'node',
  target: 'node24',
  format: 'esm',
})
// Import without invoking the handler: this catches missing runtime packages
// before deployment and never initializes a database or loads the root .env.
const handler = await import(new URL('../.server/index.mjs', import.meta.url))
if (typeof handler.default !== 'function')
  throw new Error('Missing studio API handler')
