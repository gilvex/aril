import type { DatabaseSync } from 'node:sqlite'

export function sqliteStudioManagement(db: DatabaseSync) {
  return {
    renameStudio(
      userId: string,
      id: string,
      name: string,
      expectedName: string,
    ) {
      return (
        db
          .prepare(
            `UPDATE studios SET name=? WHERE id=? AND name=? AND EXISTS
        (SELECT 1 FROM members WHERE workspace_id=studios.id AND user_id=? AND role='owner')`,
          )
          .run(name, id, expectedName, userId).changes === 1
      )
    },
    deleteStudio(userId: string, id: string, name: string) {
      db.exec('BEGIN IMMEDIATE')
      try {
        if (
          !db
            .prepare(
              `SELECT 1 FROM studios s JOIN members m ON m.workspace_id=s.id
          WHERE s.id=? AND s.name=? AND m.user_id=? AND m.role='owner'`,
            )
            .get(id, name, userId)
        ) {
          db.exec('ROLLBACK')
          return false
        }
        // Keep revoked guest identity markers so temporary profiles never become permanent.
        db.prepare(
          'UPDATE guest_links SET revoked_at=? WHERE workspace_id=?',
        ).run(Date.now(), id)
        for (const table of [
          'invites',
          'agent_credentials',
          'members',
          'studio_receipts',
          'studio_activity',
          'studio_snapshots',
          'documents',
        ])
          db.prepare(`DELETE FROM ${table} WHERE workspace_id=?`).run(id)
        db.prepare('DELETE FROM studios WHERE id=?').run(id)
        db.exec('COMMIT')
        return true
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },
  }
}
