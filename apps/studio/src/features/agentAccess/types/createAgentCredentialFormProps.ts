export type CreateAgentCredentialFormProps = {
  setBusy: (
    value:
      | import('../types').AgentAccessState['busy']
      | ((
          current: import('../types').AgentAccessState['busy'],
        ) => import('../types').AgentAccessState['busy']),
  ) => void
  setError: (
    value:
      | import('../types').AgentAccessState['error']
      | ((
          current: import('../types').AgentAccessState['error'],
        ) => import('../types').AgentAccessState['error']),
  ) => void
  setSecret: import('react').Dispatch<import('react').SetStateAction<string>>
  workspaceId: string
  setCredentials: (
    value:
      | import('../types').AgentAccessState['credentials']
      | ((
          current: import('../types').AgentAccessState['credentials'],
        ) => import('../types').AgentAccessState['credentials']),
  ) => void
  name: string
  setName: (
    value:
      | import('../types').AgentAccessState['name']
      | ((
          current: import('../types').AgentAccessState['name'],
        ) => import('../types').AgentAccessState['name']),
  ) => void
  scope: 'read' | 'write'
  setScope: (
    value:
      | import('../types').AgentAccessState['scope']
      | ((
          current: import('../types').AgentAccessState['scope'],
        ) => import('../types').AgentAccessState['scope']),
  ) => void
  days: number
  setDays: (
    value:
      | import('../types').AgentAccessState['days']
      | ((
          current: import('../types').AgentAccessState['days'],
        ) => import('../types').AgentAccessState['days']),
  ) => void
  busy: boolean
  loading: boolean
}
