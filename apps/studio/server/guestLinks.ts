import { randomBytes, randomUUID } from 'node:crypto'
import { hash } from './utils/hash.ts'

export const guestTables = `CREATE TABLE IF NOT EXISTS studio.guest_links (
  id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, workspace_id TEXT NOT NULL,
  created_by TEXT NOT NULL, name TEXT NOT NULL, expires_at BIGINT NOT NULL, revoked_at BIGINT);
  CREATE TABLE IF NOT EXISTS studio.guest_profiles (user_id TEXT PRIMARY KEY, link_id TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS guest_profiles_link ON studio.guest_profiles(link_id);`

type Query = (
  sql: string,
  values: (string | number)[],
) => Promise<Record<string, unknown>[]>

export function guestLinks(query: Query) {
  return {
    async create(
      userId: string,
      workspaceId: string,
      name: string,
      minutes: number,
    ) {
      const id = randomUUID(),
        token = randomBytes(32).toString('base64url')
      const expiresAt = Date.now() + minutes * 60000
      await query(
        'INSERT INTO studio.guest_links (id,token_hash,workspace_id,created_by,name,expires_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, hash(token), workspaceId, userId, name, expiresAt],
      )
      return { id, token, name, expiresAt }
    },
    async list(workspaceId: string) {
      return (
        await query(
          `SELECT g.id,g.name,g.expires_at,g.revoked_at,
        (SELECT COUNT(*) FROM studio.guest_profiles p WHERE p.link_id=g.id) AS guests
        FROM studio.guest_links g WHERE g.workspace_id=$1 ORDER BY g.expires_at DESC LIMIT 100`,
          [workspaceId],
        )
      ).map((row) => ({
        id: String(row.id),
        name: String(row.name),
        expiresAt: Number(row.expires_at),
        revoked: row.revoked_at !== null,
        guests: Number(row.guests),
      }))
    },
    async revoke(id: string, workspaceId: string) {
      await query(
        'UPDATE studio.guest_links SET revoked_at=$1 WHERE id=$2 AND workspace_id=$3 AND revoked_at IS NULL',
        [Date.now(), id, workspaceId],
      )
      return (
        await query(
          'SELECT p.user_id FROM studio.guest_profiles p JOIN studio.guest_links g ON g.id=p.link_id WHERE g.id=$1 AND g.workspace_id=$2',
          [id, workspaceId],
        )
      ).map((row) => String(row.user_id))
    },
  }
}
