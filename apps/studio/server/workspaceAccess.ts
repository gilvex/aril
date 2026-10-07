import type {
  StudioSummary,
  WorkspaceMember,
} from '@pomegranate/domain/studios'

type Query = (
  sql: string,
  values: (string | number)[],
) => Promise<Record<string, unknown>[]>
export function workspaceAccess(query: Query) {
  return {
    async role(
      userId: string,
      workspaceId: string,
    ): Promise<StudioSummary['role'] | null> {
      const rows = await query(
        `SELECT role FROM studio.members m WHERE user_id=$1 AND workspace_id=$2
        AND (role!='guest' OR EXISTS (SELECT 1 FROM studio.guest_profiles gp JOIN studio.guest_links g ON g.id=gp.link_id WHERE gp.user_id=m.user_id AND g.workspace_id=m.workspace_id AND g.revoked_at IS NULL AND g.expires_at>$3))`,
        [userId, workspaceId, Date.now()],
      )
      return (rows[0]?.role as StudioSummary['role']) || null
    },
    async list(workspaceId: string): Promise<WorkspaceMember[]> {
      return (
        await query(
          `SELECT p.id,p.name,p.avatar,p.color,m.role,g.expires_at AS "guestExpiresAt"
        FROM studio.members m JOIN studio.profiles p ON p.id=m.user_id
        LEFT JOIN studio.guest_profiles gp ON gp.user_id=p.id LEFT JOIN studio.guest_links g ON g.id=gp.link_id
        WHERE m.workspace_id=$1 ORDER BY CASE WHEN m.role='owner' THEN 0 ELSE 1 END,p.name`,
          [workspaceId],
        )
      ).map((row) => ({
        ...row,
        guestExpiresAt: row.guestExpiresAt ? Number(row.guestExpiresAt) : null,
      })) as WorkspaceMember[]
    },
    async update(
      actorId: string,
      workspaceId: string,
      userId: string,
      role: 'member' | 'viewer',
    ) {
      return (
        (
          await query(
            `UPDATE studio.members SET role=$1 WHERE workspace_id=$2 AND user_id=$3 AND role IN ('member','viewer')
        AND EXISTS (SELECT 1 FROM studio.members owner WHERE owner.workspace_id=$4 AND owner.user_id=$5 AND owner.role='owner') RETURNING user_id`,
            [role, workspaceId, userId, workspaceId, actorId],
          )
        ).length > 0
      )
    },
    async remove(actorId: string, workspaceId: string, userId: string) {
      const removed =
        (
          await query(
            `DELETE FROM studio.members WHERE workspace_id=$1 AND user_id=$2 AND role!='owner'
        AND EXISTS (SELECT 1 FROM studio.members owner WHERE owner.workspace_id=$3 AND owner.user_id=$4 AND owner.role='owner') RETURNING user_id`,
            [workspaceId, userId, workspaceId, actorId],
          )
        ).length > 0
      if (removed) {
        await query(
          'DELETE FROM studio.agent_credentials WHERE user_id=$1 AND workspace_id=$2 RETURNING id',
          [userId, workspaceId],
        )
        await query(
          'UPDATE studio.invites SET used=1 WHERE created_by=$1 AND workspace_id=$2 RETURNING token_hash',
          [userId, workspaceId],
        )
      }
      return removed
    },
  }
}
