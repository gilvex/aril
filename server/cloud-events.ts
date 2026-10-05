import type { Request, Response } from 'express'
import type { Store } from './store-contract.ts'
import type { Profile } from '../domain/collaboration.ts'

// Saved documents only. Live presence uses an independent WebSocket session.
export async function cloudEvents(
  req: Request,
  res: Response,
  store: Store,
  workspaceId: string,
  profile: Profile,
  authenticate: () => Promise<Profile | undefined>,
) {
  const cloud = store.cloud!
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-store, no-transform')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()
  let closed = false,
    timer: ReturnType<typeof setTimeout> | undefined
  let revision = -1,
    lastAuth = 0
  const write = (event: string, value: unknown) => {
    if (res.writableLength > 2 * 1024 * 1024) {
      res.end()
      return
    }
    if (!closed)
      res.write(`event: ${event}\ndata: ${JSON.stringify(value)}\n\n`)
  }
  const close = () => {
    if (closed) return
    closed = true
    clearTimeout(timer)
    clearTimeout(lifetime)
    res.end()
  }
  const lifetime = setTimeout(close, 55000)
  res.on('close', close)
  req.on('aborted', close)
  const tick = async () => {
    if (closed) return
    try {
      if (Date.now() - lastAuth > 10000) {
        if (
          !(await authenticate()) ||
          !(await store.member(profile.id, workspaceId))
        ) {
          close()
          return
        }
        lastAuth = Date.now()
        res.write(': heartbeat\n\n')
      }
      const nextRevision = await cloud.revision(workspaceId)
      if (closed) return
      if (nextRevision !== revision) {
        const document = await store.read(workspaceId)
        revision = document.revision
        write('workspace', document)
        write('activity', await store.activity(workspaceId))
      }
    } catch {
      close()
      return
    }
    if (!closed) timer = setTimeout(() => void tick(), 1000)
  }
  await tick()
  // Keep the Vercel invocation alive for the entire stream.
  if (!closed) await new Promise<void>((resolve) => res.once('close', resolve))
}
