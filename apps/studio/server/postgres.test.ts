import { diffWorkspace } from '@pomegranate/domain/collaboration'
import type { Envelope } from '@pomegranate/domain/workspace'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { createApplication } from './app.ts'
import { openPostgres } from './postgres.ts'

test(
  'Postgres: concurrent instances share isolated edits, invites and transfers without cursor rows',
  { skip: !process.env.POSTGRES_TEST_URL },
  async () => {
    const schema = 'pomegranate_test_' + Date.now()
    const a = await openPostgres(process.env.POSTGRES_TEST_URL!, schema)
    const b = await openPostgres(process.env.POSTGRES_TEST_URL!, schema)
    const first = createApplication(a),
      second = createApplication(b)
    const servers = [
      first.app.listen(0, '127.0.0.1'),
      second.app.listen(0, '127.0.0.1'),
    ]
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolve) => server.once('listening', resolve)),
      ),
    )
    const urls = servers.map(
      (server) =>
        `http://127.0.0.1:${(server.address() as { port: number }).port}`,
    )
    const controllers: AbortController[] = []
    const call = (
      instance: number,
      path: string,
      token: string,
      method = 'GET',
      body?: unknown,
      workspaceId = 'default',
    ) =>
      fetch(urls[instance] + path, {
        method,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
          'x-workspace-id': workspaceId,
          'x-pomegranate-auth': '1',
          'x-pomegranate-write-version': '2',
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
    try {
      const owner = (await a.identity.bootstrap())!
      const googleRace = await Promise.all([
        a.identity.registerGoogle(
          'same-google-subject',
          'google@example.test',
          'Google User',
        ),
        b.identity.registerGoogle(
          'same-google-subject',
          'google@example.test',
          'Google User',
        ),
      ])
      assert.equal(googleRace[0].profile.id, googleRace[1].profile.id)
      assert.deepEqual(await b.studios(googleRace[0].profile.id), [])
      assert.equal(
        (
          await call(1, '/api/studios', googleRace[0].token, 'POST', {
            name: 'Not invited',
          })
        ).status,
        403,
      )
      const googleInvite = await a.identity.invite(owner.profile.id)
      assert.equal(
        (
          await call(1, '/api/join', googleRace[1].token, 'POST', {
            token: googleInvite.token,
          })
        ).status,
        200,
      )
      assert.equal((await a.studios(googleRace[0].profile.id)).length, 1)
      const agent = await a.agents.create(
        owner.profile.id,
        'default',
        'PG agent',
        'write',
        30,
      )
      assert.equal(
        (await b.agents.authenticate(agent.token))?.workspaceId,
        'default',
      )
      assert.equal(
        (await b.agents.list(owner.profile.id, 'default'))[0].name,
        'PG agent',
      )
      const agentRead = await call(1, '/api/agent/workspace', agent.token)
      assert.equal(agentRead.status, 200)
      const agentState = await a.read()
      const agentEdit = await call(
        1,
        '/api/agent/workspace',
        agent.token,
        'PATCH',
        {
          baseRevision: agentState.revision,
          requestId: randomUUID(),
          operations: [
            {
              path: ['notes'],
              before: agentState.workspace.notes,
              after: 'PG agent test',
            },
          ],
        },
      )
      assert.equal(agentEdit.status, 200)
      assert.equal((await a.read()).workspace.notes, 'PG agent test')
      await a.agents.revoke(agent.credential.id, owner.profile.id, 'default')
      assert.equal(await b.agents.authenticate(agent.token), undefined)
      const invitation = await a.identity.invite(owner.profile.id)
      const races = await Promise.all([
        a.identity.join(invitation.token, 'Sam'),
        b.identity.join(invitation.token, 'Mira'),
      ])
      assert.equal(races.filter(Boolean).length, 1)
      const peer = races.find(Boolean)!
      assert.equal(
        (await b.identity.authenticate(owner.token))?.id,
        owner.profile.id,
      )
      const privateStudio = await a.createStudio(
        owner.profile.id,
        'Private workspace',
      )
      const overviews = await b.studioOverviews(peer.profile.id)
      assert.deepEqual(
        overviews.map((studio) => studio.id),
        ['default'],
      )
      assert.ok(
        overviews[0].nodes.length > 0 && overviews[0].nodes.length <= 16,
      )
      assert.ok(overviews[0].edges.length <= 32)
      // Owner, the Google-linked invitee, and the winner of the invite race.
      assert.equal(overviews[0].memberCount, 3)
      const ownerOverviews = await a.studioOverviews(owner.profile.id)
      assert.equal(
        ownerOverviews.find((studio) => studio.id === privateStudio.id)?.nodes
          .length,
        0,
      )
      assert.equal(
        (
          await call(
            1,
            '/api/workspace',
            peer.token,
            'GET',
            undefined,
            privateStudio.id,
          )
        ).status,
        403,
      )
      assert.equal(
        (
          await call(
            1,
            '/api/events?clientId=' + randomUUID(),
            peer.token,
            'GET',
            undefined,
            privateStudio.id,
          )
        ).status,
        403,
      )
      const original = await a.read()
      const edits = [
        { ...original.workspace, notes: 'A’s notes' },
        {
          ...original.workspace,
          design: { ...original.workspace.design, direction: 'B’s design' },
        },
      ]
      const responses = await Promise.all(
        edits.map((workspace, i) =>
          call(i, '/api/workspace', i ? peer.token : owner.token, 'PATCH', {
            requestId: randomUUID(),
            baseRevision: original.revision,
            operations: diffWorkspace(original.workspace, workspace),
          }),
        ),
      )
      assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409])
      const staleIndex = responses.findIndex((r) => r.status === 409)
      const fresh = await a.read()
      assert.equal(
        (
          await call(
            staleIndex,
            '/api/workspace',
            staleIndex ? peer.token : owner.token,
            'PATCH',
            {
              requestId: randomUUID(),
              baseRevision: fresh.revision,
              operations: diffWorkspace(original.workspace, edits[staleIndex]),
            },
          )
        ).status,
        200,
      )
      const current = await b.read()
      assert.equal(current.workspace.notes, 'A’s notes')
      assert.equal(current.workspace.design.direction, 'B’s design')
      assert.equal(current.revision, original.revision + 2)
      assert.equal((await b.history()).length, current.revision - 1)
      const reqId = randomUUID(),
        operations = diffWorkspace(current.workspace, {
          ...current.workspace,
          notes: 'Exactly once',
        })
      await Promise.all([
        call(0, '/api/workspace', owner.token, 'PATCH', {
          requestId: reqId,
          baseRevision: current.revision,
          operations,
        }),
        call(1, '/api/workspace', owner.token, 'PATCH', {
          requestId: reqId,
          baseRevision: current.revision,
          operations,
        }),
      ])
      assert.equal((await a.read()).revision, current.revision + 1)
      const transfer = await a.createTransfer(peer.profile.id)
      const redeemed = await call(1, '/api/auth/transfer', '', 'POST', {
        token: transfer,
      })
      assert.equal(redeemed.status, 200)
      assert.equal(
        ((await redeemed.json()) as { profile: { id: string } }).profile.id,
        peer.profile.id,
      )
      assert.equal(
        (await call(0, '/api/auth/transfer', '', 'POST', { token: transfer }))
          .status,
        401,
      )
      const clientId = randomUUID(),
        controller = new AbortController()
      controllers.push(controller)
      const stream = await fetch(urls[0] + '/api/events?clientId=' + clientId, {
        headers: { Authorization: 'Bearer ' + owner.token },
        signal: controller.signal,
      })
      assert.equal(stream.status, 200)
      const reader = stream.body!.getReader(),
        decoder = new TextDecoder()
      let buffer = ''
      const next = async (
        event: string,
        accept: (value: unknown) => boolean,
      ) => {
        const timeout = setTimeout(() => controller.abort(), 10000)
        try {
          for (;;) {
            const boundary = buffer.indexOf('\n\n')
            if (boundary >= 0) {
              const block = buffer.slice(0, boundary)
              buffer = buffer.slice(boundary + 2)
              if (block.startsWith(`event: ${event}\n`)) {
                const value = JSON.parse(block.split('\ndata: ')[1])
                if (accept(value)) return value
              }
            } else {
              const part = await reader.read()
              if (part.done) throw new Error('Stream ended')
              buffer += decoder.decode(part.value, { stream: true })
            }
          }
        } finally {
          clearTimeout(timeout)
        }
      }
      await next(
        'workspace',
        (value) => (value as Envelope).revision === current.revision + 1,
      )
      const presence = {
        clientId,
        boardId: current.workspace.boards[0].id,
        view: 'canvas',
        cursor: { x: 120, y: 130 },
        selected: [],
        sequence: 2,
      }
      // Legacy cursor POSTs must never turn back into database writes.
      assert.equal(
        (await call(1, '/api/presence', owner.token, 'POST', presence)).status,
        428,
      )
      assert.equal(
        (
          await a.query('SELECT to_regclass($1) name', [
            schema + '.live_presence',
          ])
        ).rows[0].name,
        null,
      )
      const latest = await b.read()
      await call(1, '/api/workspace', peer.token, 'PATCH', {
        requestId: randomUUID(),
        baseRevision: latest.revision,
        operations: diffWorkspace(latest.workspace, {
          ...latest.workspace,
          notes: 'From a separate instance',
        }),
      })
      await next(
        'workspace',
        (value) =>
          (value as Envelope).workspace.notes === 'From a separate instance',
      )
      controller.abort()
      await reader.cancel().catch(() => {})
      assert.equal(
        await a.access.update(
          owner.profile.id,
          'default',
          peer.profile.id,
          'viewer',
        ),
        true,
      )
      assert.equal(await b.access.role(peer.profile.id, 'default'), 'viewer')
      const readOnly = await b.read()
      await assert.rejects(
        b.save(
          readOnly.workspace,
          readOnly.revision,
          undefined,
          'default',
          peer.profile.id,
        ),
        /permission/,
      )
      assert.equal(
        (
          await call(1, '/api/workspace', peer.token, 'PUT', {
            baseRevision: readOnly.revision,
            workspace: readOnly.workspace,
          })
        ).status,
        403,
      )
      assert.equal(
        (await b.access.list('default')).find(
          (member) => member.id === peer.profile.id,
        )?.role,
        'viewer',
      )
      assert.equal(
        await a.access.remove(owner.profile.id, 'default', owner.profile.id),
        false,
      )
      assert.equal(
        await a.access.remove(owner.profile.id, 'default', peer.profile.id),
        true,
      )
      assert.equal(await b.member(peer.profile.id, 'default'), false)
      assert.equal(
        (
          await a.query('SELECT has_schema_privilege($1,$2,$3) allowed', [
            'anon',
            schema,
            'USAGE',
          ])
        ).rows[0].allowed,
        false,
      )
    } finally {
      controllers.forEach((c) => c.abort())
      first.collaboration.close()
      second.collaboration.close()
      await Promise.all(
        servers.map(
          (server) =>
            new Promise<void>((resolve) => server.close(() => resolve())),
        ),
      )
      await b.close()
      // This schema is generated by this test and cannot reference application data.
      await a.query(`DROP SCHEMA ${schema} CASCADE`)
      await a.close()
    }
  },
)
