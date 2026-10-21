import type { DatabaseSync } from 'node:sqlite'
import { invitationEligibility } from '../config/invitationEligibility.ts'
export function sqliteAcceptInvitation(
  db: DatabaseSync,
  userId: string,
  id: string,
) {
  db.exec('BEGIN IMMEDIATE')
  try {
    const row = db
      .prepare(
        `UPDATE account_invitations SET status='accepted' WHERE ${invitationEligibility.replaceAll('studio.', '').replace(/\$\d+/g, '?')} AND id=? RETURNING workspace_id,role`,
      )
      .get(Date.now(), userId, userId, userId, id)
    if (row)
      db.prepare(
        'INSERT OR IGNORE INTO members(workspace_id,user_id,role) VALUES (?,?,?)',
      ).run(String(row.workspace_id), userId, String(row.role))
    db.exec('COMMIT')
    return row ? String(row.workspace_id) : null
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
