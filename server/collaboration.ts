import type { Express, Request, Response } from 'express'
import { z } from 'zod'
import {
  applyOperations,
  describeOperations,
  MergeConflict,
  operationsSchema,
  presenceSchema,
  type Presence,
  type Profile,
} from '../domain/collaboration.ts'
import type { openStore } from './store.ts'
import { verifyGoogle } from './google.ts'

type Store = ReturnType<typeof openStore>
export function installCollaboration(
  app: Express,
  store: Store,
  publicOrigin?: string,
) {
  const clients = new Map<
    string,
    { res: Response; userId: string; workspaceId: string; presence: Presence }
  >()
  const write = (res: Response, event: string, value: unknown) => {
    if (res.writableLength > 2 * 1024 * 1024) {
      res.end()
      return
    }
    res.write(`event: ${event}\ndata: ${JSON.stringify(value)}\n\n`)
  }
  const broadcast = (
    event: string,
    value: unknown,
    workspaceId = 'default',
  ) => {
    for (const client of clients.values())
      if (client.workspaceId === workspaceId) write(client.res, event, value)
  }
  const people = (workspaceId: string) =>
    [...clients.values()]
      .filter((c) => c.workspaceId === workspaceId)
      .map((c) => ({
        ...c.presence,
        cursor:
          Date.now() - c.presence.seenAt > 15000 ? null : c.presence.cursor,
      }))
  const presenceChanged = (workspaceId: string) =>
    broadcast('presence', people(workspaceId), workspaceId)
  const cookieProfile = (req: Request) => {
    const bearer = req.get('authorization')?.match(/^Bearer ([\w-]{43})$/)?.[1]
    if (bearer) return store.identity.authenticate(bearer)
    const token = req.headers.cookie
      ?.split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('pomegranate_session='))
      ?.slice('pomegranate_session='.length)
    return token ? store.identity.authenticate(token) : undefined
  }
  const setSession = (res: Response, token: string) =>
    res.cookie('pomegranate_session', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: publicOrigin?.startsWith('https:') || false,
      maxAge: 30 * 86400000,
      path: '/',
    })
  app.get('/api/auth/config', (_req, res) =>
    res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null }),
  )
  app.post('/api/auth/google/challenge', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      res
        .status(503)
        .json({
          error: 'Google sign-in has not been configured by the studio host.',
        })
      return
    }
    if (req.get('x-pomegranate-auth') !== '1') {
      res.status(400).json({ error: 'Invalid authentication request.' })
      return
    }
    res.json(store.identity.challenge(cookieProfile(req)?.id))
  })
  app.post('/api/auth/google', async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      res
        .status(503)
        .json({
          error: 'Google sign-in has not been configured by the studio host.',
        })
      return
    }
    const input = z
      .object({
        credential: z.string().max(12000),
        challenge: z.string().length(43),
        link: z.boolean(),
      })
      .safeParse(req.body)
    if (!input.success || req.get('x-pomegranate-auth') !== '1') {
      res.status(400).json({ error: 'Invalid authentication request.' })
      return
    }
    const current = cookieProfile(req)
    const nonce = store.identity.consumeChallenge(
      input.data.challenge,
      current?.id,
    )
    if (!nonce) {
      res.status(401).json({ error: 'Sign-in expired. Please try again.' })
      return
    }
    try {
      const google = await verifyGoogle(input.data.credential, clientId, nonce)
      if (input.data.link) {
        if (!current) {
          res
            .status(401)
            .json({
              error: 'Join with your invitation before connecting Google.',
            })
          return
        }
        if (
          !store.identity.linkGoogle(current.id, google.subject, google.email)
        ) {
          res
            .status(409)
            .json({
              error:
                'This Google account or profile is already connected to a different identity.',
            })
          return
        }
        res.json({ profile: current, email: google.email })
        return
      }
      if (current) {
        res
          .status(409)
          .json({
            error:
              'You are already signed in. Connect Google from your profile.',
          })
        return
      }
      const signedIn = store.identity.signInGoogle(google.subject)
      if (!signedIn) {
        res
          .status(403)
          .json({
            error:
              'Join with an invitation first, then connect Google from your profile. If you joined before, connect it in that original browser.',
          })
        return
      }
      setSession(res, signedIn.token)
      res.json(signedIn)
    } catch {
      res
        .status(401)
        .json({ error: 'Could not verify Google sign-in. Please try again.' })
    }
  })
  app.get('/api/session', (req, res) => {
    const profile = cookieProfile(req)
    if (profile) {
      res.json({ profile })
      return
    }
    const loopback =
      ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(
        req.socket.remoteAddress || '',
      ) && ['127.0.0.1', 'localhost', '[::1]'].includes(req.hostname)
    const first = loopback ? store.identity.bootstrap() : null
    if (first) {
      setSession(res, first.token)
      res.json({ profile: first.profile, token: first.token })
      return
    }
    res.status(401).json({
      error: 'An invitation is needed to join this studio.',
      inviteRequired: true,
    })
  })
  const joinAttempts = new Map<string, { count: number; until: number }>()
  app.post('/api/join', (req, res) => {
    const key = req.socket.remoteAddress || 'unknown'
    const attempt = joinAttempts.get(key)
    if (attempt && attempt.until > Date.now() && attempt.count >= 20) {
      res
        .status(429)
        .json({ error: 'Too many attempts. Try again in a minute.' })
      return
    }
    if (joinAttempts.size > 1000) joinAttempts.clear()
    joinAttempts.set(key, {
      count: attempt && attempt.until > Date.now() ? attempt.count + 1 : 1,
      until:
        attempt && attempt.until > Date.now()
          ? attempt.until
          : Date.now() + 60000,
    })
    const input = z
      .object({
        token: z.string().min(20).max(100),
        name: z.string().trim().min(1).max(60),
      })
      .safeParse(req.body)
    if (!input.success) {
      res
        .status(400)
        .json({ error: 'Enter your name and a valid invite code.' })
      return
    }
    const joined = store.identity.join(
      input.data.token,
      input.data.name,
      cookieProfile(req)?.id,
    )
    if (!joined) {
      res
        .status(403)
        .json({ error: 'This invite is invalid, expired, or already used.' })
      return
    }
    if (joined.token) setSession(res, joined.token)
    res.json(joined)
  })
  app.use('/api', (req, res, next) => {
    const profile = cookieProfile(req)
    if (!profile) {
      res.status(401).json({
        error: 'Your session expired. Reload and join with a new invitation.',
      })
      return
    }
    res.locals.profile = profile
    next()
  })
  app.get('/api/studios', (_req, res) =>
    res.json(store.studios((res.locals.profile as Profile).id)),
  )
  app.get('/api/account', (_req, res) =>
    res.json({
      google:
        store.identity.account((res.locals.profile as Profile).id) || null,
    }),
  )
  app.post('/api/studios', (req, res) => {
    const input = z
      .object({ name: z.string().trim().min(1).max(100) })
      .safeParse(req.body)
    if (!input.success) {
      res
        .status(400)
        .json({ error: 'Use a workspace name of 1–100 characters.' })
      return
    }
    res
      .status(201)
      .json(
        store.createStudio((res.locals.profile as Profile).id, input.data.name),
      )
  })
  app.use('/api', (req, res, next) => {
    if (
      !/^\/(workspace|history|events|presence|invites)(\/|$)/.test(req.path)
    ) {
      next()
      return
    }
    const workspaceId = req.get('x-workspace-id') || 'default'
    if (!store.member((res.locals.profile as Profile).id, workspaceId)) {
      res
        .status(403)
        .json({ error: 'You do not have access to this workspace.' })
      return
    }
    res.locals.workspaceId = workspaceId
    next()
  })
  app.post('/api/invites', (_req, res) =>
    res.json(
      store.identity.invite(
        (res.locals.profile as Profile).id,
        res.locals.workspaceId,
      ),
    ),
  )
  app.put('/api/profile', (req, res) => {
    const input = z
      .object({
        name: z.string().trim().min(1).max(60),
        avatar: z.string().max(180000),
      })
      .safeParse(req.body)
    if (!input.success) {
      res.status(400).json({
        error: 'Use a name of 1–60 characters and an image under 130 KB.',
      })
      return
    }
    const { name, avatar } = input.data
    if (avatar) {
      const match =
        /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
          avatar,
        )
      const bytes = match ? Buffer.from(match[2], 'base64') : Buffer.alloc(0)
      const valid =
        match &&
        ((match[1] === 'png' &&
          bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
          (match[1] === 'jpeg' &&
            bytes[0] === 255 &&
            bytes[1] === 216 &&
            bytes[2] === 255) ||
          (match[1] === 'webp' &&
            bytes.toString('ascii', 0, 4) === 'RIFF' &&
            bytes.toString('ascii', 8, 12) === 'WEBP'))
      if (!valid) {
        res
          .status(400)
          .json({ error: 'Choose a PNG, JPEG, or WebP profile picture.' })
        return
      }
    }
    const profile = store.identity.update(
      (res.locals.profile as Profile).id,
      name,
      avatar,
    )
    for (const client of clients.values())
      if (client.userId === profile.id) client.presence.profile = profile
    for (const workspaceId of new Set(
      [...clients.values()]
        .filter((client) => client.userId === profile.id)
        .map((client) => client.workspaceId),
    ))
      presenceChanged(workspaceId)
    res.json({ profile })
  })
  app.get('/api/events', (req, res) => {
    const clientId = z.string().uuid().safeParse(req.query.clientId)
    if (!clientId.success) {
      res.status(400).json({ error: 'Invalid client.' })
      return
    }
    const profile = res.locals.profile as Profile
    const workspaceId = res.locals.workspaceId as string
    const key = `${workspaceId}:${profile.id}:${clientId.data}`
    clients.get(key)?.res.end()
    clients.delete(key)
    if (clients.size >= 64) {
      res
        .status(503)
        .json({ error: 'This studio has reached its live connection limit.' })
      return
    }
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()
    clients.set(key, {
      res,
      userId: profile.id,
      workspaceId,
      presence: {
        clientId: clientId.data,
        profile,
        boardId: null,
        view: 'canvas',
        cursor: null,
        selected: [],
        seenAt: Date.now(),
      },
    })
    write(res, 'workspace', store.read(workspaceId))
    write(res, 'activity', store.activity(workspaceId))
    presenceChanged(workspaceId)
    const heartbeat = setInterval(() => {
      if (!cookieProfile(req)) {
        res.end()
        return
      }
      res.write(': heartbeat\n\n')
    }, 15000)
    req.on('close', () => {
      clearInterval(heartbeat)
      if (clients.get(key)?.res === res) {
        clients.delete(key)
        presenceChanged(workspaceId)
      }
    })
  })
  app.post('/api/presence', (req, res) => {
    const input = presenceSchema.safeParse(req.body)
    if (!input.success) {
      res.status(400).json({ error: 'Invalid presence.' })
      return
    }
    const workspaceId = res.locals.workspaceId as string
    const key = `${workspaceId}:${(res.locals.profile as Profile).id}:${input.data.clientId}`
    const client = clients.get(key)
    if (
      client &&
      (input.data.sequence === undefined ||
        client.presence.sequence === undefined ||
        input.data.sequence > client.presence.sequence)
    ) {
      client.presence = {
        ...input.data,
        profile: res.locals.profile as Profile,
        seenAt: Date.now(),
      }
      presenceChanged(workspaceId)
    }
    res.status(204).end()
  })
  app.patch('/api/workspace', (req, res) => {
    const input = z
      .object({ requestId: z.string().uuid(), operations: operationsSchema })
      .safeParse(req.body)
    if (!input.success) {
      res.status(400).json({ error: 'Invalid changes.' })
      return
    }
    const actor = res.locals.profile as Profile
    const workspaceId = res.locals.workspaceId as string
    if (store.receipt(actor.id, input.data.requestId, workspaceId)) {
      res.json(store.read(workspaceId))
      return
    }
    try {
      const current = store.read(workspaceId)
      const next = applyOperations(current.workspace, input.data.operations)
      if (!input.data.operations.length) {
        res.json(current)
        return
      }
      const saved = store.save(
        next,
        current.revision,
        {
          id: actor.id,
          name: actor.name,
          message: describeOperations(input.data.operations),
          requestId: input.data.requestId,
        },
        workspaceId,
      )!
      broadcast('workspace', saved, workspaceId)
      broadcast('activity', store.activity(workspaceId), workspaceId)
      res.json(saved)
    } catch (err) {
      if (err instanceof MergeConflict || err instanceof z.ZodError) {
        res.status(409).json({
          error:
            err instanceof MergeConflict
              ? err.message
              : 'A related item changed. Reload the shared version before retrying.',
          latest: store.read(workspaceId),
        })
        return
      }
      res.status(400).json({ error: 'These changes could not be applied.' })
    }
  })
  return {
    broadcast,
    close: () => {
      for (const client of clients.values()) client.res.end()
      clients.clear()
    },
  }
}
