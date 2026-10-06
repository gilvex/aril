import type { AgentCredential } from '@pomegranate/domain/agentAccess'

export type AgentCredentialRowProps = {
  credential: AgentCredential
  t: import('i18next').TFunction<'translation', undefined>
  busy: boolean
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
  workspaceId: string
  setCredentials: (
    value:
      | import('../types/agentAccessState.ts').AgentAccessState['credentials']
      | ((
          current: import('../types/agentAccessState.ts').AgentAccessState['credentials'],
        ) => import('../types/agentAccessState.ts').AgentAccessState['credentials']),
  ) => void
  setSecret: import('react').Dispatch<import('react').SetStateAction<string>>
}
