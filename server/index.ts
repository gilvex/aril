import { resolve } from 'node:path'
import { createApp } from './app.ts'
const { app, store, collaboration } = createApp(
  resolve(process.env.POMEGRANATE_DATA_DIR || 'data', 'studio.sqlite'),
  process.env.POMEGRANATE_ORIGIN,
)
const port = Number(process.env.PORT || 4317)
const host = process.env.HOST || '127.0.0.1'
if (
  !['127.0.0.1', 'localhost', '::1'].includes(host) &&
  !process.env.POMEGRANATE_ORIGIN
)
  throw new Error(
    'Set POMEGRANATE_ORIGIN to the shared studio URL before enabling remote access.',
  )
const server = app.listen(port, host, () =>
  console.log(`Pomegranate studio API: http://${host}:${port}`),
)
const stop = () => {
  collaboration.close()
  server.close(() => {
    store.close()
    process.exit(0)
  })
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
