import { createApplication } from '../app.ts'
import { openPostgres } from '../postgres.ts'
export async function initialize() {
  const store = await openPostgres()
  const { app } = createApplication(
    store,
    process.env.POMEGRANATE_ORIGIN || 'https://arilapp.vercel.app',
    [
      'https://aril.studio',
      'https://www.aril.studio',
      'https://arilapp.vercel.app',
      'https://pomegranate.gilgil.co',
      'https://pomegrenate.vercel.app',
      ...(process.env.POMEGRANATE_ADDITIONAL_ORIGINS || '')
        .split(',')
        .filter(Boolean),
    ],
  )
  return app
}
