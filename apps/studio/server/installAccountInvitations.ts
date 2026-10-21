import type { Express } from 'express'
import { z } from 'zod'
import type { Store } from './storeContract.ts'
import { sendInvitationEmail } from './utils/sendInvitationEmail.ts'
export function installAccountInvitations(
  app: Express,
  store: Store,
  origin: string,
) {
  const searches = new Map<string, { count: number; until: number }>()
  app.use(
    [
      '/api/notifications',
      '/api/directory',
      '/api/account-invitations',
      '/api/username',
    ],
    async (_req, res, next) => {
      if (
        res.locals.profile.guestExpiresAt ||
        !(await store.identity.accounts(res.locals.profile.id)).length
      ) {
        res
          .status(403)
          .json({
            error:
              'Connect a sign-in account to use invitations and usernames.',
          })
        return
      }
      next()
    },
  )
  app.get('/api/notifications', async (_req, res) =>
    res.json(await store.invitations.list(res.locals.profile.id)),
  )
  app.post('/api/notifications/:id/:decision', async (req, res) => {
    const userId = res.locals.profile.id
    if (req.params.decision === 'decline') {
      const ok = await store.invitations.decline(userId, String(req.params.id))
      res
        .status(ok ? 200 : 404)
        .json(
          ok
            ? { ok: true }
            : { error: 'This invitation is no longer available.' },
        )
      return
    }
    if (req.params.decision !== 'accept') {
      res.sendStatus(404)
      return
    }
    const workspaceId = await store.invitations.accept(
      userId,
      String(req.params.id),
    )
    if (!workspaceId) {
      res.status(404).json({ error: 'This invitation is no longer available.' })
      return
    }
    res.json(
      (await store.studios(userId)).find((studio) => studio.id === workspaceId),
    )
  })
  app.get('/api/directory', async (req, res) => {
    const id = res.locals.profile.id,
      now = Date.now(),
      old = searches.get(id)
    if (old && old.until > now && old.count >= 60) {
      res
        .status(429)
        .json({ error: 'Too many searches. Try again in a minute.' })
      return
    }
    if (searches.size > 10000) searches.clear()
    searches.set(id, {
      count: old && old.until > now ? old.count + 1 : 1,
      until: old && old.until > now ? old.until : now + 60000,
    })
    if (
      (await store.access.role(id, req.get('x-workspace-id') || 'default')) !==
      'owner'
    ) {
      res.sendStatus(403)
      return
    }
    const text = String(req.query.q || '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '')
    if (text.length < 3 || text.length > 254) {
      res.json([])
      return
    }
    res.json(await store.invitations.search(text))
  })
  app.put('/api/username', async (req, res) => {
    const username = String(req.body?.username || '')
      .trim()
      .toLowerCase()
    try {
      if (
        !(await store.invitations.setUsername(res.locals.profile.id, username))
      ) {
        res
          .status(409)
          .json({
            error:
              'Choose an available username: 3–30 letters, numbers or underscores, starting with a letter. The user_ prefix is reserved.',
          })
        return
      }
      res.json({ profile: await store.identity.profile(res.locals.profile.id) })
    } catch (error) {
      if (
        (error as { code?: string }).code === '23505' ||
        String(error).includes('UNIQUE constraint')
      ) {
        res.status(409).json({ error: 'That username is already taken.' })
        return
      }
      throw error
    }
  })
  app.post('/api/account-invitations', async (req, res) => {
    const actor = res.locals.profile,
      workspace = req.get('x-workspace-id') || 'default'
    if ((await store.access.role(actor.id, workspace)) !== 'owner') {
      res
        .status(403)
        .json({ error: 'Only the workspace owner can manage access.' })
      return
    }
    const input = z
      .object({
        email: z.email().max(254).optional(),
        userId: z.string().uuid().optional(),
        role: z.enum(['member', 'viewer']),
      })
      .safeParse(req.body)
    if (!input.success || (!input.data.email && !input.data.userId)) {
      res
        .status(400)
        .json({ error: 'Enter an email address or choose a user.' })
      return
    }
    const { userId, role } = input.data
    const email = userId
      ? await store.invitations.recipient(userId)
      : input.data.email!.trim().toLowerCase()
    if (!email) {
      res
        .status(400)
        .json({ error: 'This user has no verified email address.' })
      return
    }
    const id = await store.invitations.create(
      actor.id,
      workspace,
      email,
      userId || null,
      role,
    )
    if (!id) {
      res
        .status(429)
        .json({
          error:
            'Please wait before inviting again. You can send up to 20 invitations per hour.',
        })
      return
    }
    const studio = (await store.studios(actor.id)).find(
      (item) => item.id === workspace,
    )!
    const delivery = await sendInvitationEmail(
      id,
      email,
      studio.name,
      actor.name,
      origin,
    )
    await store.invitations.delivery(id, delivery)
    res.status(201).json({ id, delivery })
  })
}
