import { createApplication } from '../app.ts'
import { openPostgres } from '../postgres.ts'
import { vercelPreviewOrigins } from './vercelPreviewOrigins.ts'
export async function initialize() {
  const store = await openPostgres()
  const { app } = createApplication(
    store,
    process.env.ARIL_ORIGIN ||
      process.env.POMEGRANATE_ORIGIN ||
      'https://arilapp.vercel.app',
    [
      'https://aril.studio',
      'https://www.aril.studio',
      'https://arilapp.vercel.app',
      'https://aril.gilgil.co',
      'https://pomegranate.gilgil.co',
      'https://pomegrenate.vercel.app',
      ...vercelPreviewOrigins(),
      ...(
        process.env.ARIL_ADDITIONAL_ORIGINS ||
        process.env.POMEGRANATE_ADDITIONAL_ORIGINS ||
        ''
      )
        .split(',')
        .filter(Boolean),
    ],
  )
  return app
}
