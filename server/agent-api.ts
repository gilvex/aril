import { Router, type Express } from 'express'
import { z } from 'zod'
import {
  agentAccessInput,
  type AgentCredential,
} from '../domain/agent-access.ts'
import {
  applyOperations,
  describeOperations,
  MergeConflict,
  operationsSchema,
} from '../domain/collaboration.ts'
import { workspaceSchema } from '../domain/workspace.ts'
import type { Store } from './store-contract.ts'

export function installAgentApi(
  app: Express,
  store: Store,
  broadcast: (event: string, data: unknown, workspaceId: string) => void,
) {
  const api = Router()
  api.use(async (req, res, next) => {
    const token = req
      .get('authorization')
      ?.match(/^Bearer (pome_agent_[\w-]{43})$/)?.[1]
    const credential = token
      ? await store.agents.authenticate(token)
      : undefined
    if (!credential) {
      res
        .status(401)
        .json({ error: 'Agent credential is invalid, expired, or revoked.' })
      return
    }
    if (
      req.get('x-workspace-id') &&
      req.get('x-workspace-id') !== credential.workspaceId
    ) {
      res
        .status(403)
        .json({ error: 'This credential belongs to another workspace.' })
      return
    }
    res.locals.agent = credential
    next()
  })
  api.get('/workspace', async (_req, res) => {
    const agent = res.locals.agent as AgentCredential
    const studio = (await store.studios(agent.userId)).find(
      (s) => s.id === agent.workspaceId,
    )
    res.json({
      studio,
      scope: agent.scope,
      ...(await store.read(agent.workspaceId)),
    })
  })
  api.get('/schema', (_req, res) => res.json(z.toJSONSchema(workspaceSchema)))
  api.get('/history', async (_req, res) => {
    const id = (res.locals.agent as AgentCredential).workspaceId
    res.json({
      history: await store.history(id),
      activity: await store.activity(id),
    })
  })
  api.patch('/workspace', async (req, res) => {
    const agent = res.locals.agent as AgentCredential
    if (agent.scope !== 'write') {
      res.status(403).json({ error: 'This credential is read-only.' })
      return
    }
    const input = z
      .object({
        requestId: z.string().uuid(),
        baseRevision: z.number().int().positive().safe(),
        operations: operationsSchema.min(1).max(500),
      })
      .safeParse(req.body)
    if (!input.success) {
      res
        .status(400)
        .json({
          error: 'Invalid edit batch.',
          details: input.error.issues.slice(0, 5),
        })
      return
    }
    if (
      input.data.operations.some(
        (op) =>
          !['boards', 'requirements', 'notes', 'design'].includes(op.path[0]),
      )
    ) {
      res.status(400).json({ error: 'Unsupported change path.' })
      return
    }
    const { requestId, baseRevision, operations } = input.data
    const actorId = `agent:${agent.id}`
    if (await store.receipt(actorId, requestId, agent.workspaceId)) {
      res.json({
        revision: (await store.read(agent.workspaceId)).revision,
        duplicate: true,
      })
      return
    }
    const current = await store.read(agent.workspaceId)
    if (current.revision !== baseRevision) {
      res
        .status(409)
        .json({
          code: 'STALE_REVISION',
          revision: current.revision,
          error:
            'Read the latest workspace and rebase your intended changes. Nothing was applied.',
        })
      return
    }
    try {
      const next = applyOperations(current.workspace, operations)
      const owner = await store.identity.profile(agent.userId)
      const saved = await store.save(
        next,
        baseRevision,
        {
          id: actorId,
          name: `${agent.name} (agent · ${owner?.name || 'member'})`,
          message: describeOperations(operations),
          requestId,
        },
        agent.workspaceId,
      )
      if (!saved) {
        res
          .status(409)
          .json({
            code: 'STALE_REVISION',
            error:
              'Workspace changed during this edit. Read it again before retrying.',
          })
        return
      }
      broadcast('workspace', saved, agent.workspaceId)
      broadcast(
        'activity',
        await store.activity(agent.workspaceId),
        agent.workspaceId,
      )
      res.json({ revision: saved.revision, savedAt: saved.savedAt })
    } catch (error) {
      if (!(error instanceof MergeConflict || error instanceof z.ZodError))
        throw error
      res
        .status(409)
        .json({
          error:
            error instanceof MergeConflict
              ? error.message
              : 'Invalid graph or document.',
          details:
            error instanceof z.ZodError ? error.issues.slice(0, 5) : undefined,
        })
    }
  })
  // Never let agent credentials fall through to user/account endpoints.
  api.use((_req, res) => {
    res.status(404).json({ error: 'Agent endpoint not found.' })
  })
  app.use('/api/agent', api)
}

// Installed after the regular user-session middleware. Credentials cannot manage themselves.
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
      (await store.agents.list(res.locals.profile.id, res.locals.workspaceId))
        .length >= 25
    ) {
      res
        .status(400)
        .json({
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
