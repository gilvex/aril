import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { cpus, platform, tmpdir } from 'node:os'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { diffWorkspace } from '@pomegranate/domain/collaboration'
import { writeVersion } from '@pomegranate/domain/freshness'
import type { Envelope } from '@pomegranate/domain/workspace'
import { createApp } from '../apps/studio/server/app.ts'

// This harness always creates its own local database and ephemeral loopback server.
// It does not load .env, accept a remote target, or open application data.
const temporaryRoot = join(tmpdir(), 'opencode')
mkdirSync(temporaryRoot, { recursive: true })
const directory = mkdtempSync(join(temporaryRoot, 'aril-benchmark-'))
const writesPerClient = 20
const results = []
try {
  for (const clients of [1, 4, 8]) {
    const { app, store, collaboration } = createApp(
      join(directory, `clients-${clients}.sqlite`),
    )
    const server = app.listen(0, '127.0.0.1')
    try {
      await once(server, 'listening')
      const address = server.address()
      assert.ok(address && typeof address !== 'string')
      const url = `http://127.0.0.1:${address.port}/api/workspace`
      const owner = store.identity.bootstrap()
      assert.ok(owner)
      const initial = store.read()
      initial.workspace.documents = Array.from({ length: clients }, (_, i) => ({
        id: `worker-${i}`,
        title: `Worker ${i}`,
        body: 'initial',
      }))
      assert.ok(store.save(initial.workspace, initial.revision))
      const baseRevision = store.read().revision
      const headers = {
        Authorization: `Bearer ${owner.token}`,
        'Content-Type': 'application/json',
        'x-pomegranate-write-version': writeVersion,
      }
      const read = async () => {
        const response = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(10000),
        })
        assert.equal(response.status, 200)
        return (await response.json()) as Envelope
      }
      // Warm the HTTP path without making an unreported write.
      await read()
      const latencies: number[] = []
      let conflicts = 0
      const started = performance.now()
      const workers = await Promise.allSettled(
        Array.from({ length: clients }, async (_, worker) => {
          for (let edit = 0; edit < writesPerClient; edit++) {
            const start = performance.now()
            const requestId = randomUUID()
            let saved = false
            for (
              let attempt = 0;
              attempt <= clients * writesPerClient;
              attempt++
            ) {
              const current = await read()
              const next = structuredClone(current.workspace)
              next.documents!.find(
                (note) => note.id === `worker-${worker}`,
              )!.body = `edit-${edit}`
              const response = await fetch(url, {
                method: 'PATCH',
                headers,
                signal: AbortSignal.timeout(10000),
                body: JSON.stringify({
                  requestId,
                  baseRevision: current.revision,
                  operations: diffWorkspace(current.workspace, next),
                }),
              })
              await response.arrayBuffer()
              if (response.status === 409) {
                conflicts++
                continue
              }
              assert.equal(response.status, 200)
              saved = true
              break
            }
            assert.ok(
              saved,
              'A logical edit exhausted its conflict retry budget',
            )
            latencies.push(performance.now() - start)
          }
        }),
      )
      for (const worker of workers)
        if (worker.status === 'rejected') throw worker.reason
      const elapsedMs = performance.now() - started
      const final = await read()
      assert.equal(final.revision, baseRevision + clients * writesPerClient)
      for (const note of final.workspace.documents!)
        assert.equal(note.body, `edit-${writesPerClient - 1}`)
      latencies.sort((a, b) => a - b)
      const percentile = (p: number) =>
        Number(latencies[Math.ceil(latencies.length * p) - 1].toFixed(2))
      results.push({
        clients,
        writes: latencies.length,
        conflicts,
        failures: 0,
        elapsedMs: Number(elapsedMs.toFixed(2)),
        writesPerSecond: Number(
          (latencies.length / (elapsedMs / 1000)).toFixed(2),
        ),
        logicalEditP50Ms: percentile(0.5),
        logicalEditP95Ms: percentile(0.95),
        logicalEditMaxMs: Number(latencies.at(-1)!.toFixed(2)),
        documentBytes: Buffer.byteLength(JSON.stringify(final.workspace)),
      })
    } finally {
      collaboration.close()
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      )
      store.close()
    }
  }
  const report = {
    recordedAt: new Date().toISOString(),
    node: process.version,
    platform: platform(),
    cpu: cpus()[0]?.model,
    logicalCpus: cpus().length,
    workload:
      'One seeded workspace per scenario; concurrent clients edit distinct note bodies through real HTTP GET/PATCH; fresh revision read and immediate retry after 409; one read warmup; 20 writes per client.',
    limits:
      'Single-process SQLite and loopback clients share a process and machine. No browser, SSE observers, TLS, network delay, sustained-load soak, or Postgres is measured. Latencies include reads and all conflict retries. This is a baseline, not a production capacity claim.',
    results,
  }
  mkdirSync('artifacts/verification', { recursive: true })
  writeFileSync(
    'artifacts/verification/collaboration.json',
    JSON.stringify(report, null, 2) + '\n',
  )
  console.log(JSON.stringify(report, null, 2))
} finally {
  rmSync(directory, { recursive: true, force: true })
}
