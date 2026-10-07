import type { Express } from 'express'
import { z } from 'zod'
import type { Store } from '../storeContract.ts'
export function installWorkspaceAccess(
  app: Express,
  store: Store,
  disconnect: (workspaceId: string, userId: string) => void,
) {
  app.use('/api/members', async (req, res, next) => {
    const id = req.get('x-workspace-id') || 'default'
    const role = await store.access.role(res.locals.profile.id, id)
    if (!role || (req.method !== 'GET' && role !== 'owner')) {
      res
        .status(403)
        .json({ error: 'Only the workspace owner can manage access.' })
      return
    }
    res.locals.workspaceId = id
    next()
  })
  app.get('/api/members', async (_req, res) =>
    res.json(await store.access.list(res.locals.workspaceId)),
  )
  app.patch('/api/members/:id', async (req, res) => {
    const input = z
      .object({ role: z.enum(['member', 'viewer']) })
      .strict()
      .safeParse(req.body)
    if (!input.success) {
      res.status(400).json({ error: 'Choose Editor or Viewer.' })
      return
    }
    const id = String(req.params.id)
    if (
      !(await store.access.update(
        res.locals.profile.id,
        res.locals.workspaceId,
        id,
        input.data.role,
      ))
    ) {
      res
        .status(409)
        .json({ error: 'Owners and temporary guest roles cannot be changed.' })
      return
    }
    disconnect(res.locals.workspaceId, id)
    res.json(await store.access.list(res.locals.workspaceId))
  })
  app.delete('/api/members/:id', async (req, res) => {
    const id = String(req.params.id)
    if (
      !(await store.access.remove(
        res.locals.profile.id,
        res.locals.workspaceId,
        id,
      ))
    ) {
      res.status(409).json({ error: 'The workspace owner cannot be removed.' })
      return
    }
    disconnect(res.locals.workspaceId, id)
    res.status(204).end()
  })
}
