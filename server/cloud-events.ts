import type { Request, Response } from 'express'
import type { Store } from './store-contract.ts'
import type { Profile, Presence } from '../domain/collaboration.ts'
import { randomUUID } from 'node:crypto'

// Each stream has a bounded lifetime; the client reconnects for a new lease.
// Postgres is authoritative, so presence and edits survive switching instances.
export async function cloudEvents(
  req: Request,
  res: Response,
  store: Store,
  workspaceId: string,
  profile: Profile,
  clientId: string,
  authenticate: () => Promise<Profile | undefined>,
) {
  const cloud = store.cloud!
  const lease = randomUUID()
  const initial: Presence = {
    clientId,
    profile,
    boardId: null,
    view: 'canvas',
    cursor: null,
    selected: [],
    seenAt: Date.now(),
  }
  await cloud.register(workspaceId, initial, lease)
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-store, no-transform')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()
  let closed = false,
    timer: ReturnType<typeof setTimeout> | undefined
  let revision = -1,
    lastPresence = '',
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
    void cloud.remove(workspaceId, profile.id, clientId, lease).catch(() => {})
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
        await cloud.heartbeat(workspaceId, profile.id, clientId, lease)
        lastAuth = Date.now()
        res.write(': heartbeat\n\n')
      }
      const [nextRevision, people] = await Promise.all([
        cloud.revision(workspaceId),
        cloud.presence(workspaceId),
      ])
      if (closed) return
      if (nextRevision !== revision) {
        const document = await store.read(workspaceId)
        revision = document.revision
        write('workspace', document)
        write('activity', await store.activity(workspaceId))
      }
      const serialized = JSON.stringify(people)
      if (serialized !== lastPresence) {
        lastPresence = serialized
        write('presence', people)
      }
    } catch {
      close()
      return
    }
    if (!closed) timer = setTimeout(() => void tick(), 250)
  }
  await tick()
  // Keep the Vercel invocation alive for the entire stream.
  if (!closed) await new Promise<void>((resolve) => res.once('close', resolve))
}
