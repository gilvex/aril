import type { Express } from 'express'
import { z } from 'zod'
import type { Store } from '../storeContract.ts'

export function installStudioManagement(
  app: Express,
  store: Store,
  disconnect: (id: string) => void,
) {
  app.use('/api/studios/:id', async (req, res, next) => {
    if (!['PATCH', 'DELETE'].includes(req.method)) return next()
    if (
      res.locals.profile.guestExpiresAt ||
      (await store.access.role(
        res.locals.profile.id,
        String(req.params.id),
      )) !== 'owner'
    ) {
      res
        .status(403)
        .json({ error: 'Only the workspace owner can rename or delete it.' })
      return
    }
    next()
  })
  app.patch('/api/studios/:id', async (req, res) => {
    const input = z
      .object({
        name: z.string().trim().min(1).max(100),
        expectedName: z.string().min(1).max(100),
      })
      .strict()
      .safeParse(req.body)
    if (!input.success) {
      res
        .status(400)
        .json({ error: 'Use a workspace name of 1–100 characters.' })
      return
    }
    if (
      !(await store.renameStudio(
        res.locals.profile.id,
        String(req.params.id),
        input.data.name,
        input.data.expectedName,
      ))
    ) {
      res
        .status(409)
        .json({
          error: 'The workspace changed. Refresh the list and try again.',
        })
      return
    }
    res.status(204).end()
  })
  app.delete('/api/studios/:id', async (req, res) => {
    const input = z
      .object({ name: z.string().min(1).max(100) })
      .strict()
      .safeParse(req.body)
    if (!input.success) {
      res
        .status(400)
        .json({ error: 'Enter the workspace name to confirm deletion.' })
      return
    }
    const id = String(req.params.id)
    if (
      !(await store.deleteStudio(res.locals.profile.id, id, input.data.name))
    ) {
      res
        .status(409)
        .json({
          error: 'The workspace changed. Refresh the list and try again.',
        })
      return
    }
    disconnect(id)
    res.status(204).end()
  })
}
