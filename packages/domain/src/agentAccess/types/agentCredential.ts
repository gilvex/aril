export type AgentCredential = {
  id: string
  userId: string
  target: 'account' | 'workspace'
  workspaceId: string
  name: string
  scope: 'read' | 'write'
  createdAt: number
  expiresAt: number
}
