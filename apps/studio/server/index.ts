import { resolve } from 'node:path'
import { createApp, createApplication } from './app.ts'
import { dataDirectory } from './paths.ts'
import { openPostgres } from './postgres.ts'
// A single long-running process owns every write, so it can push saves and
// presence in memory instead of polling Postgres and using Supabase Realtime.
const singleProcess = process.env.ARIL_LIVE_TRANSPORT === 'local'
const { app, store, collaboration } =
  (process.env.ARIL_STORAGE || process.env.POMEGRANATE_STORAGE) === 'postgres'
    ? createApplication(
        singleProcess
          ? { ...(await openPostgres()), cloud: undefined }
          : await openPostgres(),
        process.env.ARIL_ORIGIN || process.env.POMEGRANATE_ORIGIN,
        (
          process.env.ARIL_ADDITIONAL_ORIGINS ||
          process.env.POMEGRANATE_ADDITIONAL_ORIGINS ||
          ''
        )
          .split(',')
          .filter(Boolean),
      )
    : createApp(
        resolve(dataDirectory(), 'studio.sqlite'),
        process.env.ARIL_ORIGIN || process.env.POMEGRANATE_ORIGIN,
        (
          process.env.ARIL_ADDITIONAL_ORIGINS ||
          process.env.POMEGRANATE_ADDITIONAL_ORIGINS ||
          ''
        )
          .split(',')
          .filter(Boolean),
      )
// Express trust-proxy value for a reverse proxy in front of the studio, so
// rate limits see client addresses rather than the proxy's.
if (process.env.ARIL_TRUST_PROXY)
  app.set('trust proxy', process.env.ARIL_TRUST_PROXY)
const port = Number(process.env.PORT || 4317)
const host = process.env.HOST || '127.0.0.1'
if (
  !['127.0.0.1', 'localhost', '::1'].includes(host) &&
  !(process.env.ARIL_ORIGIN || process.env.POMEGRANATE_ORIGIN)
)
  throw new Error(
    'Set ARIL_ORIGIN to the shared studio URL before enabling remote access.',
  )
const server = app.listen(port, host, () =>
  console.log(`Aril studio API: http://${host}:${port}`),
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
