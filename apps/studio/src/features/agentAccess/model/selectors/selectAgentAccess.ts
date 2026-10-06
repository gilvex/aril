import type { AgentAccessState } from '@/features/agentAccess/types/agentAccessState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectAgentAccess = createSelector(
  [(state: AgentAccessState) => state],
  (state) => ({ ...state }),
)
