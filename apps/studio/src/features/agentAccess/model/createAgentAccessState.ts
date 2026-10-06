import type { AgentCredential } from '@pomegranate/domain/agentAccess'
export function createAgentAccessState() {
  const credentials: AgentCredential[] = []
  const name: string = 'Codex'
  const scope: 'read' | 'write' = 'read'
  const days: number = 30
  const error: string = ''
  const busy: boolean = false
  const loading: boolean = true
  return { credentials, name, scope, days, error, busy, loading }
}
