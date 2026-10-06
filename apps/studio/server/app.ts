import { writeVersion, writeVersionHeader } from '@pomegranate/domain/freshness'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import express from 'express'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'
import { installAgentApi, installAgentManagement } from './agentApi.ts'
import { installCollaboration } from './collaboration.ts'
import { frontendDirectory } from './paths.ts'
import type { Store } from './storeContract.ts'

export { createApp } from './utils/appCreateApp.ts'
export function createApplication<T extends Store>(
  store: T,
  publicOrigin?: string,
) {
  if (publicOrigin) {
    const url = new URL(publicOrigin)
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error('POMEGRANATE_ORIGIN must be an HTTP or HTTPS origin.')
    publicOrigin = url.origin
  }
  const app = express()
  app.disable('x-powered-by')
  app.use('/api', (req, res, next) => {
    if (
      ![
        'localhost',
        '127.0.0.1',
        '[::1]',
        ...(publicOrigin ? [new URL(publicOrigin).hostname] : []),
      ].includes(req.hostname)
    ) {
      res.status(403).json({ error: 'This studio host is not allowed.' })
      return
    }
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    const origin = req.get('origin')
    if (
      origin &&
      ![
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        `http://${req.get('host')}`,
        ...(publicOrigin ? [publicOrigin] : []),
      ].includes(origin)
    ) {
      res.status(403).json({ error: 'This origin is not allowed.' })
      return
    }
    next()
  })
  app.use(express.json({ limit: '5mb' }))
  app.use('/api/workspace', (req, res, next) => {
    if (
      ['PATCH', 'PUT'].includes(req.method) &&
      req.get(writeVersionHeader) !== writeVersion
    ) {
      res.status(428).json({
        code: 'CLIENT_UPDATE_REQUIRED',
        error:
          'This page is out of date. Export any unsaved edits, then reload to use the current editor. The shared workspace has not been changed.',
      })
      return
    }
    next()
  })
  app.get('/api/health', async (_req, res) => {
    res.json({ ok: true })
  })
  installAgentApi(app, store, (event, data, id) =>
    collaboration.broadcast(event, data, id),
  )
  const collaboration = installCollaboration(app, store, publicOrigin)
  installAgentManagement(app, store)
  app.get('/api/workspace', async (_req, res) => {
    res.json(await store.read(res.locals.workspaceId))
  })
  app.put('/api/workspace', async (req, res) => {
    const result = z
      .object({
        revision: z.number().int().positive(),
        workspace: workspaceSchema,
      })
      .safeParse(req.body)
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid workspace. Check node connections and required fields.',
        details: result.error.issues.slice(0, 5),
      })
      return
    }
    const updated = await store.save(
      result.data.workspace,
      result.data.revision,
      undefined,
      res.locals.workspaceId,
    )
    if (!updated) {
      res.status(409).json({
        error:
          'This workspace changed in another tab. Export your edits before reloading.',
      })
      return
    }
    res.json(updated)
    collaboration.broadcast('workspace', updated, res.locals.workspaceId)
  })
  app.get('/api/history', async (_req, res) => {
    res.json(await store.history(res.locals.workspaceId))
  })
  app.get('/api/history/:revision', async (req, res) => {
    const revision = Number(req.params.revision)
    if (!Number.isSafeInteger(revision) || revision < 1) {
      res.status(400).json({ error: 'Invalid revision.' })
      return
    }
    const workspace = await store.snapshot(revision, res.locals.workspaceId)
    if (!workspace) {
      res.status(404).json({ error: 'Snapshot not found.' })
      return
    }
    res.json(workspace)
  })
  if (existsSync(resolve(frontendDirectory, 'index.html'))) {
    app.use(express.static(frontendDirectory))
    app.get('/{*path}', async (req, res) => {
      if (req.path.startsWith('/api/'))
        res.status(404).json({ error: 'Endpoint not found.' })
      else res.sendFile(resolve(frontendDirectory, 'index.html'))
    })
  }
  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error('Studio request failed', {
        name: error instanceof Error ? error.name : 'Error',
        code: (error as { code?: string }).code,
      })
      const status =
        error instanceof SyntaxError
          ? 400
          : (error as { status?: number }).status === 413
            ? 413
            : 500
      res.status(status).json({
        error:
          status === 413
            ? 'Workspace exceeds 5 MB.'
            : status === 400
              ? 'Invalid JSON.'
              : 'Could not save the workspace. Your edits remain in this browser.',
      })
    },
  )
  return { app, store, collaboration }
}
