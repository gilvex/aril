import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
const children = [
  spawn(process.execPath, ['server/index.ts'], { stdio: 'inherit' }),
  spawn(
    process.execPath,
    [
      fileURLToPath(
        new URL('./bin/vite.js', import.meta.resolve('vite/package.json')),
      ),
    ],
    {
      stdio: 'inherit',
    },
  ),
]
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) child.kill()
  process.exitCode = code
}
for (const child of children) child.on('exit', (code) => stop(code ?? 0))
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
