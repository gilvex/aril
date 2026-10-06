import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// server/ and the built .server/ directory share the same location in the app.
export const repositoryRoot = fileURLToPath(
  new URL('../../../', import.meta.url),
)
export const frontendDirectory = fileURLToPath(
  new URL('../dist/', import.meta.url),
)
export const dataDirectory = () =>
  resolve(repositoryRoot, process.env.POMEGRANATE_DATA_DIR || 'data')
