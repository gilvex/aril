import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { DatabaseSync } from 'node:sqlite'
import { openStore } from '../apps/studio/server/store.ts'

// Exercise the documented stopped-server copy/restore procedure on generated data.
const temporaryRoot = join(tmpdir(), 'opencode')
mkdirSync(temporaryRoot, { recursive: true })
const directory = mkdtempSync(join(temporaryRoot, 'aril-recovery-'))
const source = join(directory, 'source')
const restored = join(directory, 'restored')
const database = join(source, 'studio.sqlite')
let store: ReturnType<typeof openStore> | undefined
try {
  store = openStore(database)
  const owner = store.identity.bootstrap()
  assert.ok(owner)
  const initial = store.read()
  const saved = store.save(
    { ...initial.workspace, notes: 'Generated recovery fixture' },
    initial.revision,
    {
      id: owner.profile.id,
      name: owner.profile.name,
      message: 'Recovery fixture',
      requestId: 'restore-check',
    },
  )
  assert.ok(saved)
  const history = store.history()
  const activity = store.activity()
  store.close()
  store = undefined
  const digest = () =>
    createHash('sha256').update(readFileSync(database)).digest('hex')
  const originalHash = digest()
  const started = performance.now()
  cpSync(source, restored, { recursive: true })
  const inspection = new DatabaseSync(join(restored, 'studio.sqlite'))
  try {
    assert.equal(
      inspection.prepare('PRAGMA integrity_check').get()?.integrity_check,
      'ok',
    )
  } finally {
    inspection.close()
  }
  store = openStore(join(restored, 'studio.sqlite'))
  assert.deepEqual(store.read(), saved)
  assert.deepEqual(store.history(), history)
  assert.deepEqual(store.activity(), activity)
  assert.deepEqual(store.snapshot(initial.revision), initial.workspace)
  assert.equal(store.identity.authenticate(owner.token)?.id, owner.profile.id)
  assert.equal(await store.access.role(owner.profile.id, 'default'), 'owner')
  assert.equal(store.receipt(owner.profile.id, 'restore-check'), true)
  assert.ok(
    store.save(
      { ...saved.workspace, notes: 'Write after restore' },
      saved.revision,
    ),
  )
  assert.equal(store.read().revision, saved.revision + 1)
  const restoreAndVerifyMs = Number((performance.now() - started).toFixed(2))
  store.close()
  store = undefined
  assert.equal(digest(), originalHash)
  const report = {
    recordedAt: new Date().toISOString(),
    node: process.version,
    backend: 'SQLite',
    checks: [
      'integrity',
      'document and revision',
      'history and snapshot',
      'activity',
      'session',
      'owner membership',
      'request receipt',
      'write after restore',
      'source unchanged',
    ],
    restoreAndVerifyMs,
    limits:
      'Generated, small, cleanly closed SQLite fixture. This verifies the procedure, not production RTO/RPO, online backups, or Postgres recovery.',
  }
  mkdirSync('artifacts/verification', { recursive: true })
  writeFileSync(
    'artifacts/verification/recovery.json',
    JSON.stringify(report, null, 2) + '\n',
  )
  console.log(JSON.stringify(report, null, 2))
} finally {
  store?.close()
  rmSync(directory, { recursive: true, force: true })
}
