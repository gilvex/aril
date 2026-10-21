export type AccountInvitation = {
  id: string
  workspaceId: string
  workspaceName: string
  inviterName: string
  role: 'member' | 'viewer'
  expiresAt: number
}
