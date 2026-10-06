import type { Express } from 'express'
import { z } from 'zod'
import type { Store } from '../storeContract.ts'

export function installGuestManagement(
  app: Express,
  store: Store,
  disconnect: (ids: string[]) => void,
) {
  app.use('/api/guest-links', async (req, res, next) => {
    const workspaceId = req.get('x-workspace-id') || 'default'
    if (
      res.locals.profile.guestExpiresAt ||
      !(await store.member(res.locals.profile.id, workspaceId))
    ) {
      res
        .status(403)
        .json({ error: 'Only workspace members can manage guest links.' })
      return
    }
    res.locals.workspaceId = workspaceId
    next()
  })
  app.get('/api/guest-links', async (_req, res) =>
    res.json(await store.guests.list(res.locals.workspaceId)),
  )
  app.post('/api/guest-links', async (req, res) => {
    const input = z
      .object({
        name: z.string().trim().min(1).max(60),
        minutes: z.number().int().min(5).max(43200),
      })
      .safeParse(req.body)
    if (!input.success) {
      res
        .status(400)
        .json({
          error: 'Choose a name and a duration from 5 minutes to 30 days.',
        })
      return
    }
    const active = (await store.guests.list(res.locals.workspaceId)).filter(
      (link) => !link.revoked && link.expiresAt > Date.now(),
    )
    if (active.length >= 25) {
      res
        .status(400)
        .json({
          error:
            'Revoke an active guest link before creating another (limit 25).',
        })
      return
    }
    res
      .status(201)
      .json(
        await store.guests.create(
          res.locals.profile.id,
          res.locals.workspaceId,
          input.data.name,
          input.data.minutes,
        ),
      )
  })
  app.delete('/api/guest-links/:id', async (req, res) => {
    disconnect(
      await store.guests.revoke(String(req.params.id), res.locals.workspaceId),
    )
    res.status(204).end()
  })
}
