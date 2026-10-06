import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { openStore } from '../apps/studio/server/store.ts'
import { openPostgres } from '../apps/studio/server/postgres.ts'
const path = resolve(
  process.env.POMEGRANATE_DATA_DIR || 'data',
  'studio.sqlite',
)
const store =
  process.env.POMEGRANATE_STORAGE === 'postgres'
    ? await openPostgres()
    : openStore(path)
const workspaceId = process.env.POMEGRANATE_WORKSPACE_ID || 'default'
try {
  await store.identity.bootstrap()
  let userId: string | undefined
  if ('query' in store) {
    userId = (
      await store.query(
        'SELECT user_id FROM studio.members WHERE workspace_id=$1 ORDER BY role DESC,user_id LIMIT 1',
        [workspaceId],
      )
    ).rows[0]?.user_id
  } else {
    const db = new DatabaseSync(path, { readOnly: true })
    try {
      userId = db
        .prepare(
          'SELECT user_id FROM members WHERE workspace_id=? ORDER BY role DESC,user_id LIMIT 1',
        )
        .get(workspaceId)?.user_id as string | undefined
    } finally {
      db.close()
    }
  }
  if (!userId)
    throw new Error('Workspace has no member. Check POMEGRANATE_WORKSPACE_ID.')
  const invite = await store.identity.invite(userId, workspaceId)
  const origin =
    process.env.POMEGRANATE_ORIGIN ||
    process.env.POMEGRANATE_CLOUD_ORIGIN ||
    `http://127.0.0.1:${process.env.PORT || 5173}`
  console.log(
    `Single-use studio invite (expires in 24 hours):\n${origin}/#invite=${invite.token}`,
  )
} finally {
  await store.close()
}
