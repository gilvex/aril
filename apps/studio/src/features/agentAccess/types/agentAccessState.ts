import type { AgentCredential } from '@pomegranate/domain/agentAccess'

export type AgentAccessState = {
  credentials: AgentCredential[]
  name: string
  scope: 'read' | 'write'
  days: number
  error: string
  busy: boolean
  loading: boolean
}
