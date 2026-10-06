import {
  applyOperations,
  describeOperations,
  operationsSchema,
} from '@pomegranate/domain/collaboration'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import { demoStorageKey } from '../config/demoStorageKey.ts'
import { createDemoState } from './createDemoState.ts'
import { createDemoStream } from './createDemoStream.ts'
import { createDemoPeers } from './createDemoPeers.ts'

export function createDemoTransport(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
) {
  const state = createDemoState(storage)
  return async (url: string, init?: RequestInit): Promise<Response> => {
    if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const path = url.split('?')[0]
    const method = init?.method || 'GET'
    const headers = new Headers(init?.headers)
    const workspaceId = headers.get('x-workspace-id')
    const fail = (error: string, status = 403) =>
      Response.json({ error }, { status })
    if (workspaceId && workspaceId !== 'demo')
      return fail('This workspace is not part of the demo.', 404)
    try {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {}
      if (path === '/api/events') return createDemoStream(state, init?.signal)
      if (path === '/api/session')
        return Response.json({ profile: state.profile })
      if (path === '/api/studios' && method === 'GET')
        return Response.json([state.studio])
      if (path === '/api/studios/overview')
        return Response.json([
          {
            ...state.studio,
            boardCount: state.envelope.workspace.boards.length,
            memberCount: 1 + createDemoPeers(state).length,
            members: [
              state.profile,
              ...createDemoPeers(state).map((peer) => peer.profile),
            ],
            nodes: state.envelope.workspace.boards[0].nodes.map((node) => ({
              id: node.id,
              kind: node.data.kind,
              title: node.data.title,
              x: node.position.x,
              y: node.position.y,
            })),
            edges: state.envelope.workspace.boards[0].edges,
          },
        ])
      if (path === '/api/auth/config')
        return Response.json({ googleClientId: null })
      if (path === '/api/account') return Response.json({ google: null })
      if (path === '/api/realtime') return Response.json({ transport: 'local' })
      if (path === '/api/presence') {
        state.presence = body
        return new Response(null, { status: 204 })
      }
      if (path === '/api/profile' && method === 'PUT') {
        state.profile = {
          ...state.profile,
          name: String(body.name || state.profile.name).slice(0, 48),
          avatar:
            typeof body.avatar === 'string' &&
            body.avatar.startsWith('data:image/')
              ? body.avatar
              : '',
        }
        return Response.json({ profile: state.profile })
      }
      if (path === '/api/workspace') {
        if (method === 'GET') return Response.json(state.envelope)
        if (!['PATCH', 'PUT'].includes(method))
          return fail('Unsupported demo action.', 405)
        if (body.baseRevision !== state.envelope.revision)
          return fail(
            'The demo has changed. Reload the saved version before trying again.',
            409,
          )
        const operations =
          method === 'PATCH' ? operationsSchema.parse(body.operations) : []
        const workspace = workspaceSchema.parse(
          method === 'PATCH'
            ? applyOperations(state.envelope.workspace, operations)
            : body.workspace,
        )
        const next = {
          workspace,
          revision: state.envelope.revision + 1,
          savedAt: new Date().toISOString(),
        }
        const history = [next, ...state.history].slice(0, 30)
        try {
          storage.setItem(
            demoStorageKey,
            JSON.stringify({ envelope: next, history }),
          )
        } catch {
          return fail(
            'Demo storage is full or unavailable. Export your edits before resetting the demo.',
            507,
          )
        }
        state.envelope = next
        state.history = history
        state.activity = [
          {
            id: Date.now(),
            userId: state.profile.id,
            name: state.profile.name,
            message: describeOperations(operations),
            createdAt: next.savedAt,
          },
          ...state.activity,
        ].slice(0, 50)
        return Response.json(next)
      }
      if (path === '/api/history')
        return Response.json(
          state.history.map(({ revision, savedAt }) => ({ revision, savedAt })),
        )
      if (path.startsWith('/api/history/')) {
        const snapshot = state.history.find(
          (item) => item.revision === Number(path.split('/').at(-1)),
        )
        return snapshot
          ? Response.json(snapshot.workspace)
          : fail('Demo revision not found.', 404)
      }
      if (path === '/api/agent-access' && method === 'GET')
        return Response.json([])
      return fail(
        'This action needs a real workspace. Exit the demo and sign in to use accounts, invitations, or agent access.',
      )
    } catch {
      return fail(
        'The demo could not apply this change. Check the data and try again.',
        400,
      )
    }
  }
}
