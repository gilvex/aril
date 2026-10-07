import { agentAccessInput } from '@pomegranate/domain/agentAccess'
import { Router, type Express } from 'express'
import type { Store } from '../storeContract.ts'
export function installAgentManagement(app: Express, store: Store) {
  const management = Router()
  management.use(async (req, res, next) => {
    const workspaceId = req.get('x-workspace-id') || 'default'
    if (!(await store.member(res.locals.profile.id, workspaceId))) {
      res.status(403).json({ error: 'Workspace access required.' })
      return
    }
    res.locals.workspaceId = workspaceId
    next()
  })
  management.get('/', async (_req, res) =>
    res.json(
      await store.agents.list(res.locals.profile.id, res.locals.workspaceId),
    ),
  )
  management.post('/', async (req, res) => {
    const parsed = agentAccessInput.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Choose a name, permission, and expiry.' })
      return
    }
    const { name, scope, days } = parsed.data
    if (
      scope === 'write' &&
      (await store.access.role(
        res.locals.profile.id,
        res.locals.workspaceId,
      )) === 'viewer'
    ) {
      res
        .status(403)
        .json({ error: 'Viewers can only create read-only agent credentials.' })
      return
    }
    if (
      (await store.agents.list(res.locals.profile.id, res.locals.workspaceId))
        .length >= 25
    ) {
      res.status(400).json({
        error:
          'Revoke an existing credential before creating another (limit 25).',
      })
      return
    }
    res
      .status(201)
      .json(
        await store.agents.create(
          res.locals.profile.id,
          res.locals.workspaceId,
          name,
          scope,
          days,
        ),
      )
  })
  management.delete('/:id', async (req, res) => {
    await store.agents.revoke(
      String(req.params.id),
      res.locals.profile.id,
      res.locals.workspaceId,
    )
    res.status(204).end()
  })
  app.use('/api/agent-access', management)
}
