import { randomUUID } from 'node:crypto'
import type {
  AccountInvitation,
  InvitationUser,
} from '@aril/domain/invitations'
import type { InvitationQuery } from './types/index.ts'
import { invitationEligibility } from './config/invitationEligibility.ts'
export function accountInvitations(
  query: InvitationQuery,
  accept: (
    userId: string,
    id: string,
  ) => Promise<string | null> | string | null,
) {
  return {
    accept,
    async username(userId: string) {
      const rows = await query(
        "SELECT COALESCE(u.username,'user_' || replace(p.id,'-','')) AS username FROM studio.profiles p LEFT JOIN studio.usernames u ON u.user_id=p.id WHERE p.id=$1",
        [userId],
      )
      return String(rows[0]?.username || '')
    },
    async setUsername(userId: string, username: string) {
      // The user_ namespace is reserved for collision-free automatic names.
      if (
        !/^[a-z][a-z0-9_]{2,29}$/.test(username) ||
        username.startsWith('user_')
      )
        return false
      const rows = await query(
        `INSERT INTO studio.usernames(user_id,username) SELECT $1,$2
        WHERE NOT EXISTS (SELECT 1 FROM studio.usernames WHERE username=$3 AND user_id!=$4)
        ON CONFLICT(user_id) DO UPDATE SET username=excluded.username RETURNING username`,
        [userId, username, username, userId],
      )
      return rows.length > 0
    },
    async search(text: string): Promise<InvitationUser[]> {
      const rows = await query(
        `SELECT DISTINCT p.id,p.name,p.avatar,COALESCE(u.username,'user_' || replace(p.id,'-','')) AS username
        FROM studio.profiles p LEFT JOIN studio.usernames u ON u.user_id=p.id JOIN studio.accounts a ON a.user_id=p.id
        WHERE NOT EXISTS (SELECT 1 FROM studio.guest_profiles g WHERE g.user_id=p.id)
        AND (lower(a.email)=$1 OR COALESCE(u.username,'user_' || replace(p.id,'-','')) LIKE $2 ESCAPE '!')
        ORDER BY username LIMIT 8`,
        [text, text.replace(/[!%_]/g, '!$&') + '%'],
      )
      return rows as InvitationUser[]
    },
    async recipient(userId: string) {
      const rows = await query(
        "SELECT email FROM studio.accounts WHERE user_id=$1 AND email!='' ORDER BY provider,issuer LIMIT 1",
        [userId],
      )
      return rows[0] ? String(rows[0].email).toLowerCase() : null
    },
    async create(
      actor: string,
      workspace: string,
      email: string,
      recipient: string | null,
      role: 'member' | 'viewer',
    ) {
      const id = randomUUID(),
        now = Date.now()
      // Keep recent receipts across workspace deletion so senders cannot reset mail limits.
      await query(
        'DELETE FROM studio.account_invitations WHERE created_by=$1 AND created_at<$2 RETURNING id',
        [actor, now - 30 * 86400000],
      )
      const rows = await query(
        `INSERT INTO studio.account_invitations(id,workspace_id,created_by,email,recipient_id,role,expires_at,created_at)
        SELECT $1,$2,$3,$4,$5,$6,$7,$8
        WHERE EXISTS (SELECT 1 FROM studio.members WHERE workspace_id=$9 AND user_id=$10 AND role='owner')
        AND (SELECT COUNT(*) FROM studio.account_invitations WHERE created_by=$11 AND created_at>$12)<20
        AND NOT EXISTS (SELECT 1 FROM studio.account_invitations WHERE workspace_id=$13 AND email=$14 AND status='pending' AND created_at>$15)
        RETURNING id`,
        [
          id,
          workspace,
          actor,
          email,
          recipient,
          role,
          now + 7 * 86400000,
          now,
          workspace,
          actor,
          actor,
          now - 3600000,
          workspace,
          email,
          now - 60000,
        ],
      )
      return rows.length ? id : null
    },
    async delivery(id: string, state: string) {
      await query(
        'UPDATE studio.account_invitations SET delivery=$1 WHERE id=$2 RETURNING id',
        [state, id],
      )
    },
    async list(userId: string): Promise<AccountInvitation[]> {
      const rows = await query(
        `SELECT i.id,i.workspace_id AS "workspaceId",s.name AS "workspaceName",p.name AS "inviterName",i.role,i.expires_at AS "expiresAt"
        FROM studio.account_invitations i JOIN studio.studios s ON s.id=i.workspace_id JOIN studio.profiles p ON p.id=i.created_by
        WHERE i.id IN (SELECT id FROM studio.account_invitations WHERE ${invitationEligibility}) ORDER BY i.created_at DESC LIMIT 100`,
        [Date.now(), userId, userId, userId],
      )
      return rows.map((row) => ({
        ...row,
        expiresAt: Number(row.expiresAt),
      })) as AccountInvitation[]
    },
    async decline(userId: string, id: string) {
      return (
        (
          await query(
            `UPDATE studio.account_invitations SET status='declined' WHERE ${invitationEligibility} AND id=$5 RETURNING id`,
            [Date.now(), userId, userId, userId, id],
          )
        ).length > 0
      )
    },
  }
}
