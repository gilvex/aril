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
import type { Store } from './store-contract.ts'
import { cloudEvents } from './cloud-events.ts'
import { verifyGoogle } from './google.ts'
import { openPostgres } from './postgres.ts'

export function installCollaboration(
  app: Express,
  store: Store,
  publicOrigin?: string,
) {
  let hosted: ReturnType<typeof openPostgres> | undefined
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
  const cookieProfile = async (req: Request) => {
    const bearer = req.get('authorization')?.match(/^Bearer ([\w-]{43})$/)?.[1]
    if (bearer) return await store.identity.authenticate(bearer)
    const token = req.headers.cookie
      ?.split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('pomegranate_session='))
      ?.slice('pomegranate_session='.length)
    return token ? await store.identity.authenticate(token) : undefined
  }
  const setSession = (res: Response, token: string) =>
    res.cookie('pomegranate_session', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: publicOrigin?.startsWith('https:') || false,
      maxAge: 30 * 86400000,
      path: '/',
    })
  app.get('/api/auth/config', async (_req, res) =>
    res.json({
      googleClientId: process.env.GOOGLE_CLIENT_ID || null,
      hostedOrigin: process.env.POMEGRANATE_CLOUD_ORIGIN || null,
    }),
  )
  app.post('/api/auth/transfer', async (req, res) => {
    const input = z
      .object({ token: z.string().regex(/^[\w-]{43}$/) })
      .safeParse(req.body)
    if (
      !input.success ||
      !store.redeemTransfer ||
      req.get('x-pomegranate-auth') !== '1'
    ) {
      res.status(400).json({ error: 'Invalid studio access link.' })
      return
    }
    const user = await store.redeemTransfer(input.data.token)
    if (!user) {
      res.status(401).json({
        error:
          'This access link expired or was already used. Open a fresh link from your local studio.',
      })
      return
    }
    setSession(res, user.token)
    res.json(user)
  })
  app.post('/api/auth/google/challenge', async (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      res.status(503).json({
        error: 'Google sign-in has not been configured by the studio host.',
      })
      return
    }
    if (req.get('x-pomegranate-auth') !== '1') {
      res.status(400).json({ error: 'Invalid authentication request.' })
      return
    }
    res.json(await store.identity.challenge((await cookieProfile(req))?.id))
  })
  app.post('/api/auth/google', async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      res.status(503).json({
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
    const current = await cookieProfile(req)
    const nonce = await store.identity.consumeChallenge(
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
          res.status(401).json({
            error: 'Join with your invitation before connecting Google.',
          })
          return
        }
        if (
          !(await store.identity.linkGoogle(
            current.id,
            google.subject,
            google.email,
          ))
        ) {
          res.status(409).json({
            error:
              'This Google account or profile is already connected to a different identity.',
          })
          return
        }
        res.json({ profile: current, email: google.email })
        return
      }
      if (current) {
        res.status(409).json({
          error: 'You are already signed in. Connect Google from your profile.',
        })
        return
      }
      const signedIn = await store.identity.signInGoogle(google.subject)
      if (!signedIn) {
        res.status(403).json({
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
  app.get('/api/session', async (req, res) => {
    const profile = await cookieProfile(req)
    if (profile) {
      res.json({ profile })
      return
    }
    const loopback =
      ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(
        req.socket.remoteAddress || '',
      ) && ['127.0.0.1', 'localhost', '[::1]'].includes(req.hostname)
    const first = loopback ? await store.identity.bootstrap() : null
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
  app.post('/api/join', async (req, res) => {
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
    const joined = await store.identity.join(
      input.data.token,
      input.data.name,
      (await cookieProfile(req))?.id,
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
  app.use('/api', async (req, res, next) => {
    const profile = await cookieProfile(req)
    if (!profile) {
      res.status(401).json({
        error: 'Your session expired. Reload and join with a new invitation.',
      })
      return
    }
    res.locals.profile = profile
    next()
  })
  app.get('/api/studios', async (_req, res) =>
    res.json(await store.studios((res.locals.profile as Profile).id)),
  )
  app.post('/api/hosted-access', async (req, res) => {
    const origin = process.env.POMEGRANATE_CLOUD_ORIGIN
    if (
      !origin ||
      !['localhost', '127.0.0.1', '[::1]'].includes(req.hostname)
    ) {
      res.status(404).json({ error: 'Hosted access is not configured here.' })
      return
    }
    const cloud = store.createTransfer
      ? store
      : await (hosted ??= openPostgres().catch((error) => {
          hosted = undefined
          throw error
        }))
    const id = (res.locals.profile as Profile).id
    if (!(await cloud.identity.profile(id))) {
      res.status(409).json({
        error: 'This profile has not been migrated to the hosted studio.',
      })
      return
    }
    const token = await cloud.createTransfer!(id)
    res.json({ url: new URL('/#transfer=' + token, origin).href })
  })
  app.get('/api/account', async (_req, res) =>
    res.json({
      google:
        (await store.identity.account((res.locals.profile as Profile).id)) ||
        null,
    }),
  )
  app.post('/api/studios', async (req, res) => {
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
        await store.createStudio(
          (res.locals.profile as Profile).id,
          input.data.name,
        ),
      )
  })
  app.use('/api', async (req, res, next) => {
    if (
      !/^\/(workspace|history|events|presence|invites)(\/|$)/.test(req.path)
    ) {
      next()
      return
    }
    const workspaceId = req.get('x-workspace-id') || 'default'
    if (
      !(await store.member((res.locals.profile as Profile).id, workspaceId))
    ) {
      res
        .status(403)
        .json({ error: 'You do not have access to this workspace.' })
      return
    }
    res.locals.workspaceId = workspaceId
    next()
  })
  app.post('/api/invites', async (_req, res) =>
    res.json(
      await store.identity.invite(
        (res.locals.profile as Profile).id,
        res.locals.workspaceId,
      ),
    ),
  )
  app.put('/api/profile', async (req, res) => {
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
    const profile = await store.identity.update(
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
  app.get('/api/events', async (req, res) => {
    const clientId = z.string().uuid().safeParse(req.query.clientId)
    if (!clientId.success) {
      res.status(400).json({ error: 'Invalid client.' })
      return
    }
    const profile = res.locals.profile as Profile
    const workspaceId = res.locals.workspaceId as string
    if (store.cloud) {
      await cloudEvents(
        req,
        res,
        store,
        workspaceId,
        profile,
        clientId.data,
        () => cookieProfile(req),
      )
      return
    }
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
    write(res, 'workspace', await store.read(workspaceId))
    write(res, 'activity', await store.activity(workspaceId))
    presenceChanged(workspaceId)
    const heartbeat = setInterval(async () => {
      if (!(await cookieProfile(req))) {
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
  app.post('/api/presence', async (req, res) => {
    const input = presenceSchema.safeParse(req.body)
    if (!input.success) {
      res.status(400).json({ error: 'Invalid presence.' })
      return
    }
    const workspaceId = res.locals.workspaceId as string
    if (store.cloud) {
      await store.cloud.put(workspaceId, {
        ...input.data,
        profile: res.locals.profile as Profile,
        seenAt: Date.now(),
      })
      res.status(204).end()
      return
    }
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
  app.patch('/api/workspace', async (req, res) => {
    const input = z
      .object({
        requestId: z.string().uuid(),
        baseRevision: z.number().int().positive().safe(),
        operations: operationsSchema,
      })
      .safeParse(req.body)
    if (!input.success) {
      res.status(400).json({ error: 'Invalid changes.' })
      return
    }
    const actor = res.locals.profile as Profile
    const workspaceId = res.locals.workspaceId as string
    if (await store.receipt(actor.id, input.data.requestId, workspaceId)) {
      res.json(await store.read(workspaceId))
      return
    }
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        if (await store.receipt(actor.id, input.data.requestId, workspaceId)) {
          res.json(await store.read(workspaceId))
          return
        }
        const current = await store.read(workspaceId)
        if (input.data.baseRevision !== current.revision) {
          res
            .status(409)
            .json({
              code: 'STALE_REVISION',
              revision: current.revision,
              error:
                'A newer workspace is already saved. Your older changes were not applied. Export your edits or load the latest saved version.',
            })
          return
        }
        const next = applyOperations(current.workspace, input.data.operations)
        if (!input.data.operations.length) {
          res.json(current)
          return
        }
        const saved = await store.save(
          next,
          current.revision,
          {
            id: actor.id,
            name: actor.name,
            message: describeOperations(input.data.operations),
            requestId: input.data.requestId,
          },
          workspaceId,
        )
        if (!saved) continue
        broadcast('workspace', saved, workspaceId)
        broadcast('activity', await store.activity(workspaceId), workspaceId)
        res.json(saved)
        return
      }
      res.status(409).json({
        error:
          'This workspace is receiving simultaneous changes. Reload the shared version before retrying.',
      })
    } catch (err) {
      if (err instanceof MergeConflict || err instanceof z.ZodError) {
        res.status(409).json({
          error:
            err instanceof MergeConflict
              ? err.message
              : 'A related item changed. Reload the shared version before retrying.',
          latest: await store.read(workspaceId),
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
      void hosted?.then((store) => store.close()).catch(() => {})
    },
  }
}
