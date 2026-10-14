import type { AgentCredential } from '@aril/domain/agentAccess'
export function createAgentAccessState() {
  const credentials: AgentCredential[] = []
  const target: 'account' | 'workspace' = 'account'
  const name: string = 'Codex'
  const scope: 'read' | 'write' = 'read'
  const days: number = 30
  const error: string = ''
  const busy: boolean = false
  const loading: boolean = true
  return { target, credentials, name, scope, days, error, busy, loading }
}
