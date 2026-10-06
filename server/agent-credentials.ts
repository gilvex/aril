import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { AgentCredential } from '../domain/agent-access.ts'

// The same queries back both SQLite and Postgres. Tokens are only returned once.
export const agentTable = `CREATE TABLE IF NOT EXISTS studio.agent_credentials (
  id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, user_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL, name TEXT NOT NULL, scope TEXT NOT NULL,
  created_at BIGINT NOT NULL, expires_at BIGINT NOT NULL);`
type Query = (
  sql: string,
  values: (string | number)[],
) => Promise<Record<string, unknown>[]>
const digest = (token: string) =>
  createHash('sha256').update(token).digest('hex')
function publicCredential(row: Record<string, unknown>): AgentCredential {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    workspaceId: String(row.workspace_id),
    name: String(row.name),
    scope: row.scope === 'write' ? 'write' : 'read',
    createdAt: Number(row.created_at),
    expiresAt: Number(row.expires_at),
  }
}
export function agentCredentials(query: Query) {
  return {
    async create(
      userId: string,
      workspaceId: string,
      name: string,
      scope: 'read' | 'write',
      days: number,
    ) {
      const id = randomUUID(),
        token = `pome_agent_${randomBytes(32).toString('base64url')}`
      const createdAt = Date.now(),
        expiresAt = createdAt + days * 86400000
      await query(
        'INSERT INTO studio.agent_credentials VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [
          id,
          digest(token),
          userId,
          workspaceId,
          name,
          scope,
          createdAt,
          expiresAt,
        ],
      )
      return {
        credential: {
          id,
          userId,
          workspaceId,
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
          'SELECT * FROM studio.agent_credentials WHERE user_id=$1 AND workspace_id=$2 ORDER BY created_at DESC',
          [userId, workspaceId],
        )
      ).map(publicCredential)
    },
    async revoke(id: string, userId: string, workspaceId: string) {
      await query(
        'DELETE FROM studio.agent_credentials WHERE id=$1 AND user_id=$2 AND workspace_id=$3',
        [id, userId, workspaceId],
      )
    },
    async authenticate(token: string) {
      if (!/^pome_agent_[\w-]{43}$/.test(token)) return undefined
      const rows = await query(
        `SELECT a.* FROM studio.agent_credentials a
        JOIN studio.members m ON m.user_id=a.user_id AND m.workspace_id=a.workspace_id
        WHERE a.token_hash=$1 AND a.expires_at>$2`,
        [digest(token), Date.now()],
      )
      return rows[0] ? publicCredential(rows[0]) : undefined
    },
  }
}
