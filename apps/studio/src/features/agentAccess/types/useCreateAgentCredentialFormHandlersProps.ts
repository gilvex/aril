export type CreateAgentCredentialFormHandlersProps = {
  setBusy: (
    value:
      | import('../types/agentAccessState.ts').AgentAccessState['busy']
      | ((
          current: import('../types/agentAccessState.ts').AgentAccessState['busy'],
        ) => import('../types/agentAccessState.ts').AgentAccessState['busy']),
  ) => void
  setError: (
    value:
      | import('../types/agentAccessState.ts').AgentAccessState['error']
      | ((
          current: import('../types/agentAccessState.ts').AgentAccessState['error'],
        ) => import('../types/agentAccessState.ts').AgentAccessState['error']),
  ) => void
  setSecret: import('react').Dispatch<import('react').SetStateAction<string>>
  workspaceId: string
  name: string
  scope: 'read' | 'write'
  days: number
  setCredentials: (
    value:
      | import('../types/agentAccessState.ts').AgentAccessState['credentials']
      | ((
          current: import('../types/agentAccessState.ts').AgentAccessState['credentials'],
        ) => import('../types/agentAccessState.ts').AgentAccessState['credentials']),
  ) => void
}
