import { workspaceAccess } from './workspaceAccess.ts'
import { WorkspaceAccessError } from './workspaceAccessError.ts'
import type { Activity, Profile } from '@pomegranate/domain/collaboration'
import { createSeed } from '@pomegranate/domain/seed'
import { blankStudio, type StudioSummary } from '@pomegranate/domain/studios'
import {
  workspaceSchema,
  type Envelope,
  type Workspace,
} from '@pomegranate/domain/workspace'
import { randomBytes, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import { guestLinks, guestTables } from './guestLinks.ts'
import { agentCredentials, agentTable } from './agentCredentials.ts'
import type { Store } from './storeContract.ts'
import { hash } from './utils/postgresHash.ts'
import { postgresUrl } from './utils/postgresPostgresUrl.ts'
import type { StudioOverview } from '@pomegranate/domain/studios'
import { postgresStudioOverviews } from './utils/postgresStudioOverviews.ts'

const colors = [
  '#b34568',
  '#426cbd',
  '#27816b',
  '#9854b2',
  '#a66a25',
  '#287b94',
]
export { postgresUrl } from './utils/postgresPostgresUrl.ts'
export async function openPostgres(
  connectionString = postgresUrl(),
  schema = 'pomegranate',
) {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema))
    throw new Error('Invalid database schema')
  const databaseUrl = new URL(connectionString)
  const supabase =
    databaseUrl.hostname.endsWith('.supabase.com') ||
    databaseUrl.hostname.endsWith('.supabase.co')
  if (supabase)
    for (const key of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey'])
      databaseUrl.searchParams.delete(key)
  const pool = new Pool({
    connectionString: databaseUrl.toString(),
    ...(supabase
      ? {
          ssl: {
            rejectUnauthorized: true,
            ca: readFileSync(
              new URL('./certs/supabase-ca.crt', import.meta.url),
              'utf8',
            ),
          },
        }
      : {}),
    max: 4,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  })
  pool.on('error', () =>
    console.error(
      'Postgres connection interrupted. A fresh connection will be opened.',
    ),
  )
  const sql = (text: string) => text.replaceAll('studio.', `${schema}.`)
  const query = <T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: unknown[] = [],
    client?: PoolClient,
  ) => (client || pool).query<T>(sql(text), values)
  async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const result = await work(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
  try {
    await transaction(async (client) => {
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        schema + ':schema-v1',
      ])
      await client.query(
        `CREATE SCHEMA IF NOT EXISTS ${schema}; REVOKE ALL ON SCHEMA ${schema} FROM PUBLIC;`,
      )
      await query(
        `CREATE TABLE IF NOT EXISTS studio.studios (id TEXT PRIMARY KEY,name TEXT NOT NULL,created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS studio.profiles (id TEXT PRIMARY KEY,name TEXT NOT NULL,avatar TEXT NOT NULL,color TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS studio.members (workspace_id TEXT NOT NULL REFERENCES studio.studios(id),user_id TEXT NOT NULL REFERENCES studio.profiles(id),role TEXT NOT NULL,PRIMARY KEY(workspace_id,user_id));
        CREATE TABLE IF NOT EXISTS studio.documents (workspace_id TEXT PRIMARY KEY REFERENCES studio.studios(id),revision INTEGER NOT NULL,body JSONB NOT NULL,saved_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS studio.studio_snapshots (workspace_id TEXT NOT NULL,revision INTEGER NOT NULL,body JSONB NOT NULL,saved_at TEXT NOT NULL,PRIMARY KEY(workspace_id,revision));
        CREATE TABLE IF NOT EXISTS studio.studio_activity (id BIGSERIAL PRIMARY KEY,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL,name TEXT NOT NULL,message TEXT NOT NULL,created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS studio.studio_receipts (workspace_id TEXT NOT NULL,id TEXT NOT NULL,revision INTEGER NOT NULL,PRIMARY KEY(workspace_id,id));
        CREATE TABLE IF NOT EXISTS studio.sessions (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES studio.profiles(id),expires_at BIGINT NOT NULL);
        CREATE TABLE IF NOT EXISTS studio.invites (token_hash TEXT PRIMARY KEY,created_by TEXT NOT NULL,expires_at BIGINT NOT NULL,used INTEGER NOT NULL DEFAULT 0,workspace_id TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS studio.accounts (subject TEXT PRIMARY KEY,user_id TEXT NOT NULL UNIQUE REFERENCES studio.profiles(id),email TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS studio.auth_challenges (token_hash TEXT PRIMARY KEY,nonce TEXT NOT NULL,user_id TEXT,expires_at BIGINT NOT NULL);
        CREATE TABLE IF NOT EXISTS studio.transfers (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES studio.profiles(id),expires_at BIGINT NOT NULL);
${agentTable}
${guestTables}
        CREATE TABLE IF NOT EXISTS studio.migrations (id TEXT PRIMARY KEY);
        CREATE INDEX IF NOT EXISTS activity_workspace ON studio.studio_activity(workspace_id,id);`,
        [],
        client,
      )
      const now = new Date().toISOString()
      await query(
        'INSERT INTO studio.studios VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        ['default', 'Aril', now],
        client,
      )
      await query(
        'INSERT INTO studio.documents VALUES ($1,1,$2,$3) ON CONFLICT DO NOTHING',
        ['default', JSON.stringify(createSeed()), now],
        client,
      )
    })
  } catch (error) {
    await pool.end()
    throw error
  }
  const profile = async (id: string, client?: PoolClient) =>
    (
      await query<Profile>(
        `SELECT p.*,g.expires_at::float8 AS "guestExpiresAt" FROM studio.profiles p LEFT JOIN studio.guest_profiles gp ON gp.user_id=p.id LEFT JOIN studio.guest_links g ON g.id=gp.link_id WHERE p.id=$1`,
        [id],
        client,
      )
    ).rows[0]
  const count = async () =>
    Number((await query('SELECT COUNT(*) n FROM studio.profiles')).rows[0].n)
  const member = async (id: string, workspaceId: string) =>
    !!(
      await query(
        `SELECT 1 FROM studio.members m WHERE m.user_id=$1 AND m.workspace_id=$2 AND (m.role!='guest' OR EXISTS (SELECT 1 FROM studio.guest_profiles gp JOIN studio.guest_links g ON g.id=gp.link_id WHERE gp.user_id=m.user_id AND g.workspace_id=m.workspace_id AND g.revoked_at IS NULL AND g.expires_at>$3))`,
        [id, workspaceId, Date.now()],
      )
    ).rowCount
  async function session(id: string, client?: PoolClient) {
    const token = randomBytes(32).toString('base64url')
    await query(
      'INSERT INTO studio.sessions VALUES ($1,$2,$3)',
      [hash(token), id, Date.now() + 30 * 86400000],
      client,
    )
    return { profile: (await profile(id, client))!, token }
  }
  async function create(name: string, client: PoolClient) {
    const id = randomUUID()
    await query(
      'INSERT INTO studio.profiles VALUES ($1,$2,$3,$4)',
      [id, name, '', colors[Math.floor(Math.random() * colors.length)]],
      client,
    )
    return session(id, client)
  }
  const read = async (
    workspaceId = 'default',
    client?: PoolClient,
    lock = false,
  ): Promise<Envelope> => {
    const row = (
      await query(
        `SELECT * FROM studio.documents WHERE workspace_id=$1${lock ? ' FOR UPDATE' : ''}`,
        [workspaceId],
        client,
      )
    ).rows[0]
    if (!row) throw new Error('Workspace not found')
    return {
      workspace: workspaceSchema.parse(row.body),
      revision: row.revision,
      savedAt: row.saved_at,
    }
  }
  const store = {
    access: workspaceAccess(
      async (sql, values) => (await query(sql, values)).rows,
    ),
    guests: guestLinks(async (sql, values) => (await query(sql, values)).rows),
    agents: agentCredentials(
      async (text, values) => (await query(text, values)).rows,
    ),
    read,
    save: async (
      workspace: Workspace,
      expected: number,
      actor?: { id: string; name: string; message: string; requestId: string },
      workspaceId = 'default',
      writerId?: string,
    ) =>
      transaction(async (client) => {
        if (
          writerId &&
          !(
            await query(
              "SELECT 1 FROM studio.members WHERE user_id=$1 AND workspace_id=$2 AND role IN ('owner','member','guest') FOR SHARE",
              [writerId, workspaceId],
              client,
            )
          ).rowCount
        )
          throw new WorkspaceAccessError()
        const clean = workspaceSchema.parse(workspace)
        const current = await read(workspaceId, client, true)
        if (current.revision !== expected) return null
        if (
          actor &&
          (
            await query(
              'SELECT 1 FROM studio.studio_receipts WHERE workspace_id=$1 AND id=$2',
              [workspaceId, actor.id + ':' + actor.requestId],
              client,
            )
          ).rowCount
        )
          return current
        await query(
          'INSERT INTO studio.studio_snapshots VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
          [
            workspaceId,
            current.revision,
            JSON.stringify(current.workspace),
            current.savedAt,
          ],
          client,
        )
        const savedAt = new Date().toISOString()
        await query(
          'UPDATE studio.documents SET revision=$2,body=$3,saved_at=$4 WHERE workspace_id=$1',
          [workspaceId, expected + 1, JSON.stringify(clean), savedAt],
          client,
        )
        if (actor) {
          await query(
            'INSERT INTO studio.studio_activity (workspace_id,user_id,name,message,created_at) VALUES ($1,$2,$3,$4,$5)',
            [workspaceId, actor.id, actor.name, actor.message, savedAt],
            client,
          )
          await query(
            'INSERT INTO studio.studio_receipts VALUES ($1,$2,$3)',
            [workspaceId, actor.id + ':' + actor.requestId, expected + 1],
            client,
          )
          await query(
            'DELETE FROM studio.studio_activity WHERE workspace_id=$1 AND id NOT IN (SELECT id FROM studio.studio_activity WHERE workspace_id=$1 ORDER BY id DESC LIMIT 200)',
            [workspaceId],
            client,
          )
          await query(
            'DELETE FROM studio.studio_receipts WHERE workspace_id=$1 AND revision < $2',
            [workspaceId, expected - 1000],
            client,
          )
        }
        await query(
          'DELETE FROM studio.studio_snapshots WHERE workspace_id=$1 AND revision < $2',
          [workspaceId, expected - 29],
          client,
        )
        return { workspace: clean, revision: expected + 1, savedAt }
      }),
    member,
    studioOverviews: async (userId: string) =>
      (await query<StudioOverview>(postgresStudioOverviews, [userId])).rows,
    studios: async (id: string) =>
      (
        await query<StudioSummary>(
          'SELECT s.id,s.name,s.created_at AS "createdAt",m.role FROM studio.studios s JOIN studio.members m ON m.workspace_id=s.id WHERE m.user_id=$1 ORDER BY s.created_at,s.id',
          [id],
        )
      ).rows,
    createStudio: async (userId: string, name: string) =>
      transaction(async (client) => {
        const id = randomUUID(),
          createdAt = new Date().toISOString()
        await query(
          'INSERT INTO studio.studios VALUES ($1,$2,$3)',
          [id, name, createdAt],
          client,
        )
        await query(
          'INSERT INTO studio.members VALUES ($1,$2,$3)',
          [id, userId, 'owner'],
          client,
        )
        await query(
          'INSERT INTO studio.documents VALUES ($1,1,$2,$3)',
          [id, JSON.stringify(blankStudio(name)), createdAt],
          client,
        )
        return { id, name, createdAt, role: 'owner' as const }
      }),
    receipt: async (id: string, requestId: string, workspaceId = 'default') =>
      !!(
        await query(
          'SELECT 1 FROM studio.studio_receipts WHERE workspace_id=$1 AND id=$2',
          [workspaceId, id + ':' + requestId],
        )
      ).rowCount,
    activity: async (workspaceId = 'default') =>
      (
        await query<Activity>(
          'SELECT id::int,user_id AS "userId",name,message,created_at AS "createdAt" FROM studio.studio_activity WHERE workspace_id=$1 ORDER BY id DESC LIMIT 50',
          [workspaceId],
        )
      ).rows,
    history: async (workspaceId = 'default') =>
      (
        await query(
          'SELECT revision,saved_at AS "savedAt" FROM studio.studio_snapshots WHERE workspace_id=$1 ORDER BY revision DESC',
          [workspaceId],
        )
      ).rows,
    snapshot: async (revision: number, workspaceId = 'default') => {
      const row = (
        await query(
          'SELECT body FROM studio.studio_snapshots WHERE workspace_id=$1 AND revision=$2',
          [workspaceId, revision],
        )
      ).rows[0]
      return row ? workspaceSchema.parse(row.body) : null
    },
    identity: {
      redeemGuest: async (token: string, name: string) =>
        transaction(async (client) => {
          const link = (
            await query(
              'UPDATE studio.guest_links SET id=id WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>$2 RETURNING id,workspace_id,expires_at',
              [hash(token), Date.now()],
              client,
            )
          ).rows[0]
          if (!link) return null
          const user = await create(name, client)
          await query(
            'INSERT INTO studio.guest_profiles VALUES ($1,$2)',
            [user.profile.id, link.id],
            client,
          )
          await query(
            'INSERT INTO studio.members VALUES ($1,$2,$3)',
            [link.workspace_id, user.profile.id, 'guest'],
            client,
          )
          await query(
            'UPDATE studio.sessions SET expires_at=$1 WHERE token_hash=$2',
            [link.expires_at, hash(user.token)],
            client,
          )
          return {
            ...user,
            profile: (await profile(user.profile.id, client))!,
            workspaceId: String(link.workspace_id),
            expiresAt: Number(link.expires_at),
          }
        }),
      count,
      profile,
      revokeSession: async (token: string) => {
        await query('DELETE FROM studio.sessions WHERE token_hash=$1', [
          hash(token),
        ])
      },
      account: async (id: string) =>
        (
          await query<{ email: string }>(
            'SELECT email FROM studio.accounts WHERE user_id=$1',
            [id],
          )
        ).rows[0],
      authenticate: async (token: string) => {
        if (!/^[\w-]{43}$/.test(token)) return undefined
        const row = (
          await query(
            `SELECT s.user_id FROM studio.sessions s LEFT JOIN studio.guest_profiles gp ON gp.user_id=s.user_id LEFT JOIN studio.guest_links g ON g.id=gp.link_id WHERE s.token_hash=$1 AND s.expires_at>$2 AND (gp.user_id IS NULL OR (g.revoked_at IS NULL AND g.expires_at>$2))`,
            [hash(token), Date.now()],
          )
        ).rows[0]
        return row ? profile(row.user_id) : undefined
      },
      bootstrap: async () =>
        transaction(async (client) => {
          await query(
            'LOCK TABLE studio.profiles IN EXCLUSIVE MODE',
            [],
            client,
          )
          if (
            (await query('SELECT 1 FROM studio.profiles LIMIT 1', [], client))
              .rowCount
          )
            return null
          const user = await create('Workspace owner', client)
          await query(
            'INSERT INTO studio.members VALUES ($1,$2,$3)',
            ['default', user.profile.id, 'owner'],
            client,
          )
          return user
        }),
      update: async (id: string, name: string, avatar: string) =>
        (
          await query<Profile>(
            'UPDATE studio.profiles SET name=$2,avatar=$3 WHERE id=$1 RETURNING *',
            [id, name, avatar],
          )
        ).rows[0],
      invite: async (id: string, workspaceId = 'default') => {
        if (!(await member(id, workspaceId)))
          throw new Error('Workspace access required')
        const token = randomBytes(24).toString('base64url'),
          expiresAt = Date.now() + 86400000
        await query(
          'DELETE FROM studio.invites WHERE expires_at<$1 OR used=1',
          [Date.now()],
        )
        await query(
          'INSERT INTO studio.invites (token_hash,created_by,expires_at,workspace_id) VALUES ($1,$2,$3,$4)',
          [hash(token), id, expiresAt, workspaceId],
        )
        return { token, expiresAt }
      },
      join: async (token: string, name: string, existingId?: string) =>
        transaction(async (client) => {
          const invite = (
            await query(
              'UPDATE studio.invites SET used=1 WHERE token_hash=$1 AND used=0 AND expires_at>$2 RETURNING workspace_id',
              [hash(token), Date.now()],
              client,
            )
          ).rows[0]
          if (!invite) return null
          const user = existingId
            ? { profile: (await profile(existingId, client))!, token: '' }
            : await create(name, client)
          await query(
            'INSERT INTO studio.members VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
            [invite.workspace_id, user.profile.id, 'member'],
            client,
          )
          return { ...user, workspaceId: invite.workspace_id as string }
        }),
      challenge: async (userId?: string) => {
        const challenge = randomBytes(32).toString('base64url'),
          nonce = randomBytes(32).toString('base64url')
        await query('DELETE FROM studio.auth_challenges WHERE expires_at<$1', [
          Date.now(),
        ])
        await query('INSERT INTO studio.auth_challenges VALUES ($1,$2,$3,$4)', [
          hash(challenge),
          nonce,
          userId || null,
          Date.now() + 300000,
        ])
        return { challenge, nonce }
      },
      consumeChallenge: async (challenge: string, userId?: string) => {
        const row = (
          await query(
            'DELETE FROM studio.auth_challenges WHERE token_hash=$1 AND expires_at>$2 RETURNING nonce,user_id',
            [hash(challenge), Date.now()],
          )
        ).rows[0]
        return row && row.user_id === (userId || null)
          ? (row.nonce as string)
          : undefined
      },
      linkGoogle: async (id: string, subject: string, email: string) =>
        transaction(async (client) => {
          if ((await profile(id, client))?.guestExpiresAt) return false
          await query(
            'LOCK TABLE studio.accounts IN EXCLUSIVE MODE',
            [],
            client,
          )
          const rows = (
            await query(
              'SELECT * FROM studio.accounts WHERE subject=$1 OR user_id=$2',
              [subject, id],
              client,
            )
          ).rows
          if (rows.some((r) => r.subject !== subject || r.user_id !== id))
            return false
          await query(
            'INSERT INTO studio.accounts VALUES ($1,$2,$3) ON CONFLICT(subject) DO UPDATE SET email=excluded.email',
            [subject, id, email],
            client,
          )
          return true
        }),
      signInGoogle: async (subject: string) => {
        const row = (
          await query('SELECT user_id FROM studio.accounts WHERE subject=$1', [
            subject,
          ])
        ).rows[0]
        return row ? session(row.user_id) : null
      },
      registerGoogle: async (subject: string, email: string, name: string) =>
        transaction(async (client) => {
          await query(
            'LOCK TABLE studio.accounts IN EXCLUSIVE MODE',
            [],
            client,
          )
          const existing = (
            await query(
              'SELECT user_id FROM studio.accounts WHERE subject=$1',
              [subject],
              client,
            )
          ).rows[0]
          const user = existing
            ? await session(existing.user_id, client)
            : await create(
                name.trim().slice(0, 60) || 'New collaborator',
                client,
              )
          await query(
            'INSERT INTO studio.accounts VALUES ($1,$2,$3) ON CONFLICT(subject) DO UPDATE SET email=excluded.email',
            [subject, user.profile.id, email],
            client,
          )
          return user
        }),
    },
    cloud: {
      revision: async (workspaceId: string) =>
        Number(
          (
            await query(
              'SELECT revision FROM studio.documents WHERE workspace_id=$1',
              [workspaceId],
            )
          ).rows[0]?.revision,
        ),
    },
    close: () => pool.end(),
  } satisfies Store
  return {
    ...store,
    query,
    transaction,
    createTransfer: async (id: string) => {
      const token = randomBytes(32).toString('base64url')
      await query('DELETE FROM studio.transfers WHERE expires_at<$1', [
        Date.now(),
      ])
      await query('INSERT INTO studio.transfers VALUES ($1,$2,$3)', [
        hash(token),
        id,
        Date.now() + 120000,
      ])
      return token
    },
    redeemTransfer: async (token: string) =>
      transaction(async (client) => {
        const row = (
          await query(
            'DELETE FROM studio.transfers WHERE token_hash=$1 AND expires_at>$2 RETURNING user_id',
            [hash(token), Date.now()],
            client,
          )
        ).rows[0]
        return row ? session(row.user_id, client) : null
      }),
  }
}
