import { createApplication } from '../app.ts'
import { openPostgres } from '../postgres.ts'
export async function initialize() {
  const store = await openPostgres()
  const { app } = createApplication(
    store,
    process.env.POMEGRANATE_ORIGIN || 'https://pomegrenate.vercel.app',
  )
  return app
}
