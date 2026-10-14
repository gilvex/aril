import type { AgentCredential } from '@aril/domain/agentAccess'

export type AgentAccessState = {
  credentials: AgentCredential[]
  name: string
  target: 'account' | 'workspace'
  scope: 'read' | 'write'
  days: number
  error: string
  busy: boolean
  loading: boolean
}
