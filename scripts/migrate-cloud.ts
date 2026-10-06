import { DatabaseSync, backup } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { openPostgres } from '../apps/studio/server/postgres.ts'
import { workspaceSchema } from '@pomegranate/domain/workspace'

// Explicit administrator command. Never runs on deployment or application startup.
// Refuses to merge into a populated cloud database and preserves local data.
const directory = resolve(process.env.POMEGRANATE_DATA_DIR || 'data')
const local = new DatabaseSync(resolve(directory, 'studio.sqlite'), {
  readOnly: true,
})
mkdirSync(resolve(directory, 'backups'), { recursive: true })
await backup(
  local,
  resolve(directory, 'backups', `before-cloud-${Date.now()}.sqlite`),
)
const cloud = await openPostgres()
try {
  await cloud.transaction(async (client) => {
    await cloud.query(
      'SELECT pg_advisory_xact_lock(hashtext($1))',
      ['pomegranate:import-local-v1'],
      client,
    )
    if (
      (
        await cloud.query(
          "SELECT 1 FROM studio.migrations WHERE id='import-local-v1'",
          [],
          client,
        )
      ).rowCount
    )
      throw new Error('Local import was already completed. No data changed.')
    if (
      (await cloud.query('SELECT 1 FROM studio.profiles LIMIT 1', [], client))
        .rowCount
    )
      throw new Error('Cloud profiles already exist; refusing to overwrite.')
    if (
      (
        await cloud.query(
          'SELECT 1 FROM studio.documents WHERE revision>1 OR workspace_id<>$1 LIMIT 1',
          ['default'],
          client,
        )
      ).rowCount
    )
      throw new Error(
        'Cloud workspaces already contain edits; refusing to overwrite.',
      )
    const tables = [
      'studios',
      'profiles',
      'members',
      'documents',
      'studio_snapshots',
      'studio_activity',
      'studio_receipts',
      'sessions',
      'invites',
      'accounts',
    ]
    for (const table of tables) {
      const rows = local.prepare(`SELECT * FROM ${table}`).all()
      for (const row of rows) {
        if (table === 'documents' || table === 'studio_snapshots')
          workspaceSchema.parse(JSON.parse(String(row.body)))
        const columns = Object.keys(row)
        const updates =
          table === 'studios' || table === 'documents'
            ? `ON CONFLICT (${table === 'studios' ? 'id' : 'workspace_id'}) DO UPDATE SET ${columns
                .filter((c) => c !== 'id' && c !== 'workspace_id')
                .map((c) => `${c}=excluded.${c}`)
                .join(',')}`
            : ''
        await cloud.query(
          `INSERT INTO studio.${table} (${columns.join(',')}) VALUES (${columns.map((_, i) => '$' + (i + 1)).join(',')}) ${updates}`,
          Object.values(row),
          client,
        )
      }
    }
    await cloud.query(
      "SELECT setval(pg_get_serial_sequence('studio.studio_activity','id'),COALESCE((SELECT MAX(id) FROM studio.studio_activity),1),EXISTS(SELECT 1 FROM studio.studio_activity))",
      [],
      client,
    )
    await cloud.query(
      "INSERT INTO studio.migrations VALUES ('import-local-v1')",
      [],
      client,
    )
  })
  const studios = local
    .prepare('SELECT workspace_id,revision,body FROM documents')
    .all()
  for (const studio of studios) {
    const migrated = await cloud.read(String(studio.workspace_id))
    if (
      migrated.revision !== studio.revision ||
      JSON.stringify(migrated.workspace) !==
        JSON.stringify(workspaceSchema.parse(JSON.parse(String(studio.body))))
    )
      throw new Error('Migration verification failed')
  }
  console.log(
    JSON.stringify({
      migrated: true,
      workspaces: studios.length,
      profiles: await cloud.identity.count(),
      verified: true,
    }),
  )
} finally {
  local.close()
  await cloud.close()
}
