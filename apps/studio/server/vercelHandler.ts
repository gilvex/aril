import type { IncomingMessage, ServerResponse } from 'node:http'
import { initialize } from './utils/vercelHandlerInitialize.ts'
let application: ReturnType<typeof initialize> | undefined

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const app = await (application ??= initialize().catch((error) => {
      application = undefined
      throw error
    }))
    await new Promise<void>((resolve) => {
      res.once('finish', resolve)
      res.once('close', resolve)
      app(req, res)
    })
  } catch {
    console.error('The studio database could not be initialized.')
    if (!res.headersSent) {
      res.statusCode = 503
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'The studio is temporarily unavailable. Please try again.',
        }),
      )
    } else res.end()
  }
}
