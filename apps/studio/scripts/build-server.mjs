import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { mkdir, copyFile } from 'node:fs/promises'
await mkdir('.server/certs', { recursive: true })
await copyFile('server/certs/supabase-ca.crt', '.server/certs/supabase-ca.crt')
await build({
  entryPoints: ['server/vercelHandler.ts'],
  outfile: '.server/index.mjs',
  bundle: true,
  packages: 'external',
  alias: {
    '@pomegranate/domain': fileURLToPath(
      new URL('../../../packages/domain/src', import.meta.url),
    ),
  },
  platform: 'node',
  target: 'node24',
  format: 'esm',
})
