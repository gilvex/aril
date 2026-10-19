import type { PoolClient, QueryResult, QueryResultRow } from 'pg'

export function postgresStudioManagement(
  query: <T extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: unknown[],
    client?: PoolClient,
  ) => Promise<QueryResult<T>>,
  transaction: <T>(work: (client: PoolClient) => Promise<T>) => Promise<T>,
) {
  return {
    async renameStudio(
      userId: string,
      id: string,
      name: string,
      expectedName: string,
    ) {
      return (
        (
          await query(
            `UPDATE studio.studios SET name=$1 WHERE id=$2 AND name=$3 AND EXISTS
        (SELECT 1 FROM studio.members WHERE workspace_id=studio.studios.id AND user_id=$4 AND role='owner')`,
            [name, id, expectedName, userId],
          )
        ).rowCount === 1
      )
    },
    deleteStudio(userId: string, id: string, name: string) {
      return transaction(async (client) => {
        const owner = await query(
          `SELECT s.id FROM studio.studios s WHERE s.id=$1 AND s.name=$2 AND EXISTS
          (SELECT 1 FROM studio.members m WHERE m.workspace_id=s.id AND m.user_id=$3 AND m.role='owner')
          FOR NO KEY UPDATE`,
          [id, name, userId],
          client,
        )
        if (!owner.rowCount) return false
        await query(
          'UPDATE studio.guest_links SET revoked_at=$1 WHERE workspace_id=$2',
          [Date.now(), id],
          client,
        )
        for (const table of [
          'invites',
          'agent_credentials',
          'members',
          'studio_receipts',
          'studio_activity',
          'studio_snapshots',
          'documents',
        ])
          await query(
            `DELETE FROM studio.${table} WHERE workspace_id=$1`,
            [id],
            client,
          )
        await query('DELETE FROM studio.studios WHERE id=$1', [id], client)
        return true
      })
    },
  }
}
