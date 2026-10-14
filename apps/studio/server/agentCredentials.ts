import { randomBytes, randomUUID } from 'node:crypto'
import { digest } from './utils/digest.ts'
import { publicCredential } from './utils/publicCredential.ts'

// The same queries back both SQLite and Postgres. Tokens are only returned once.
export const agentTable = `CREATE TABLE IF NOT EXISTS studio.agent_credentials (
  id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, user_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL, name TEXT NOT NULL, scope TEXT NOT NULL,
  created_at BIGINT NOT NULL, expires_at BIGINT NOT NULL);`
type Query = (
  sql: string,
  values: (string | number)[],
) => Promise<Record<string, unknown>[]>

export function agentCredentials(query: Query) {
  return {
    async create(
      userId: string,
      workspaceId: string,
      name: string,
      scope: 'read' | 'write',
      days: number,
      target: 'account' | 'workspace' = 'workspace',
    ) {
      // '*' is reserved for account grants; existing rows remain workspace grants.
      const grantWorkspace = target === 'account' ? '*' : workspaceId
      const id = randomUUID(),
        token = `aril_agent_${randomBytes(32).toString('base64url')}`
      const createdAt = Date.now(),
        expiresAt = createdAt + days * 86400000
      await query(
        'INSERT INTO studio.agent_credentials VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [
          id,
          digest(token),
          userId,
          grantWorkspace,
          name,
          scope,
          createdAt,
          expiresAt,
        ],
      )
      return {
        credential: {
          target,
          id,
          userId,
          workspaceId: grantWorkspace,
          name,
          scope,
          createdAt,
          expiresAt,
        },
        token,
      }
    },
    async list(userId: string, workspaceId: string) {
      return (
        await query(
          `SELECT * FROM studio.agent_credentials WHERE user_id=$1 AND (workspace_id=$2 OR workspace_id='*') ORDER BY created_at DESC`,
          [userId, workspaceId],
        )
      ).map(publicCredential)
    },
    async revoke(id: string, userId: string, workspaceId: string) {
      await query(
        `DELETE FROM studio.agent_credentials WHERE id=$1 AND user_id=$2 AND (workspace_id=$3 OR workspace_id='*')`,
        [id, userId, workspaceId],
      )
    },
    async authenticate(token: string) {
      if (!/^(?:aril|pome)_agent_[\w-]{43}$/.test(token)) return undefined
      const rows = await query(
        `SELECT a.* FROM studio.agent_credentials a
        JOIN studio.profiles p ON p.id=a.user_id
        WHERE a.token_hash=$1 AND a.expires_at>$2
        AND (a.workspace_id='*' OR EXISTS (SELECT 1 FROM studio.members m
          WHERE m.user_id=a.user_id AND m.workspace_id=a.workspace_id))`,
        [digest(token), Date.now()],
      )
      return rows[0] ? publicCredential(rows[0]) : undefined
    },
  }
}
