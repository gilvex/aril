import { build } from 'esbuild'
import { mkdir, copyFile } from 'node:fs/promises'
await mkdir('.server/certs', { recursive: true })
await copyFile('server/certs/supabase-ca.crt', '.server/certs/supabase-ca.crt')
await build({ entryPoints: ['server/vercel-handler.ts'], outfile: '.server/index.mjs', bundle: true, packages: 'external', platform: 'node', target: 'node24', format: 'esm' })
