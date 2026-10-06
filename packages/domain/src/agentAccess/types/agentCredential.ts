export type AgentCredential = {
  id: string
  userId: string
  workspaceId: string
  name: string
  scope: 'read' | 'write'
  createdAt: number
  expiresAt: number
}
