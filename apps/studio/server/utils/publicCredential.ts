import type { AgentCredential } from '@pomegranate/domain/agentAccess'
export function publicCredential(
  row: Record<string, unknown>,
): AgentCredential {
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
