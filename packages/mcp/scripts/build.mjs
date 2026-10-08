import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
const manifest = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
)

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.mjs',
  bundle: true,
  external: Object.keys(manifest.dependencies).filter(
    (name) => name !== '@pomegranate/domain',
  ),
  alias: {
    '@pomegranate/domain': fileURLToPath(
      new URL('../../domain/src', import.meta.url),
    ),
  },
  platform: 'node',
  target: 'node24',
  format: 'esm',
})
