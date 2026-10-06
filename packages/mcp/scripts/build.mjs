import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.mjs',
  bundle: true,
  packages: 'external',
  alias: {
    '@pomegranate/domain': fileURLToPath(
      new URL('../../domain/src', import.meta.url),
    ),
  },
  platform: 'node',
  target: 'node24',
  format: 'esm',
})
