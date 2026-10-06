import { resolve } from 'node:path'
import { createApp, createApplication } from './app.ts'
import { dataDirectory } from './paths.ts'
import { openPostgres } from './postgres.ts'
const { app, store, collaboration } =
  process.env.POMEGRANATE_STORAGE === 'postgres'
    ? createApplication(await openPostgres(), process.env.POMEGRANATE_ORIGIN,
        (process.env.POMEGRANATE_ADDITIONAL_ORIGINS || '').split(',').filter(Boolean))
    : createApp(
        resolve(dataDirectory(), 'studio.sqlite'),
        process.env.POMEGRANATE_ORIGIN,
        (process.env.POMEGRANATE_ADDITIONAL_ORIGINS || '').split(',').filter(Boolean),
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
  server.close(async () => {
    await store.close()
    process.exit(0)
  })
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
