export type AgentAccessHandlersProps = {
  secret: string
  setError: (
    value:
      | import('../types/agentAccessState.ts').AgentAccessState['error']
      | ((
          current: import('../types/agentAccessState.ts').AgentAccessState['error'],
        ) => import('../types/agentAccessState.ts').AgentAccessState['error']),
  ) => void
}
